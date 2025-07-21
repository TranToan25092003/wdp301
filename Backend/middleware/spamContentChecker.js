// Backend/middleware/spamContentChecker.js
const { detectSpamContent } = require('../utils/contentFilter');
const UserViolation = require('../model/userViolation.model');

/**
 * Middleware để kiểm tra nội dung gửi lên có phải là spam hay không.
 * Nếu là spam, sẽ tạo một bản ghi UserViolation và ngăn chặn request tiếp tục.
 *
 * @param {string} fieldToCheck - Tên trường trong req.body cần kiểm tra (ví dụ: 'description', 'name').
 * @param {string} violationType - Loại vi phạm sẽ ghi vào UserViolation (ví dụ: 'item_spam', 'message_spam').
 * @returns {function} - Hàm middleware Express.
 */
const checkSpamContent = (fieldToCheck, violationType = 'spam_content') => { // Đã sửa: giá trị mặc định của violationType thành 'spam_content'
    return async (req, res, next) => {

        const content = req.body[fieldToCheck];

        const userId = req.auth && req.auth.userId ? req.auth.userId : 'unknown_user';
        const userIp = req.ip || 'unknown_ip';


        if (!content || typeof content !== 'string' || content.trim() === '') {
            return next();
        }

        try {
            const isSpam = await detectSpamContent(content); // Gọi hàm kiểm tra spam

            if (isSpam) {
                console.log(`[SPAM DETECTED by Middleware] User ${userId} (IP: ${userIp}) submitted spam content in field "${fieldToCheck}" for path ${req.path}.`);


                await UserViolation.create({
                    userId: userId,
                    violationType: violationType, // Sử dụng giá trị đã được sửa đổi
                    description: `Tự động phát hiện spam trong trường '${fieldToCheck}': "${content.substring(0, 0)}..."`, // Cắt ngắn mô tả nếu quá dài
                    payload: {
                        ip: userIp,
                        userAgent: req.headers['user-agent'],
                        path: req.path,
                        contentField: fieldToCheck,
                        fullContent: content,
                    },
                    status: 'pending', // Đã sửa: 'auto-reported' thành 'pending'
                    reportedAt: new Date(),
                });


                return res.status(400).json({
                    message: `Nội dung của bạn (${fieldToCheck}) chứa từ khóa không phù hợp hoặc bị đánh dấu là spam. Vui lòng chỉnh sửa và thử lại.`
                });
            }

            next();
        } catch (error) {
            console.error(`Error in spamContentChecker middleware for field "${fieldToCheck}":`, error);

            next(error);
        }
    };
};

module.exports = { checkSpamContent };