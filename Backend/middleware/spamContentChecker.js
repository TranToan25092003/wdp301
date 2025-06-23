// src/middleware/spamContentChecker.js

const { detectSpamContent } = require('../utils/contentFilter'); // Đường dẫn đến contentFilter
const UserViolation = require('../model/userViolation.model'); // Đường dẫn đến UserViolation model

/**
 * Middleware để kiểm tra nội dung gửi lên có phải là spam hay không.
 * Nếu là spam, sẽ tạo một bản ghi UserViolation và ngăn chặn request tiếp tục.
 *
 * @param {string} fieldToCheck - Tên trường trong req.body cần kiểm tra (ví dụ: 'description', 'name').
 * @param {string} violationType - Loại vi phạm sẽ ghi vào UserViolation (ví dụ: 'item_spam', 'message_spam').
 * @returns {function} - Hàm middleware Express.
 */
const checkSpamContent = (fieldToCheck, violationType = 'content_spam') => {
    return async (req, res, next) => {
        // Lấy nội dung từ req.body dựa trên tên trường được truyền vào
        const content = req.body[fieldToCheck];
        // Lấy userId từ req.auth.userId (giả sử bạn đang dùng Clerk hoặc middleware auth)
        const userId = req.auth && req.auth.userId ? req.auth.userId : 'unknown_user';
        const userIp = req.ip || 'unknown_ip';

        // Nếu nội dung không tồn tại, không phải chuỗi, hoặc rỗng, bỏ qua kiểm tra
        if (!content || typeof content !== 'string' || content.trim() === '') {
            return next();
        }

        try {
            const isSpam = await detectSpamContent(content); // Gọi hàm kiểm tra spam

            if (isSpam) {
                console.log(`[SPAM DETECTED by Middleware] User ${userId} (IP: ${userIp}) submitted spam content in field "${fieldToCheck}" for path ${req.path}.`);

                // Tạo bản ghi UserViolation tự động
                await UserViolation.create({
                    userId: userId,
                    violationType: violationType, // Sử dụng loại vi phạm được truyền vào
                    description: `Tự động phát hiện spam trong trường '${fieldToCheck}': "${content.substring(0, 100)}..."`, // Cắt ngắn mô tả nếu quá dài
                    payload: { // Lưu trữ thêm thông tin chi tiết
                        ip: userIp,
                        userAgent: req.headers['user-agent'],
                        path: req.path,
                        contentField: fieldToCheck,
                        fullContent: content, // Lưu toàn bộ nội dung spam để admin xem
                    },
                    status: 'auto-reported', // Đặt trạng thái là 'auto-reported' hoặc 'pending_review'
                    reportedAt: new Date(),
                });

                // Ngăn chặn yêu cầu tiếp tục và gửi phản hồi lỗi cho người dùng
                return res.status(400).json({
                    message: `Nội dung của bạn (${fieldToCheck}) chứa từ khóa không phù hợp hoặc bị đánh dấu là spam. Vui lòng chỉnh sửa và thử lại.`
                });
            }
            // Nếu không phải spam, chuyển quyền điều khiển cho middleware tiếp theo hoặc route handler
            next();
        } catch (error) {
            console.error(`Error in spamContentChecker middleware for field "${fieldToCheck}":`, error);
            // Nếu có lỗi trong quá trình kiểm tra spam, vẫn cho phép request tiếp tục
            // hoặc bạn có thể chọn gửi lỗi 500 nếu muốn
            next(error);
        }
    };
};

module.exports = { checkSpamContent };