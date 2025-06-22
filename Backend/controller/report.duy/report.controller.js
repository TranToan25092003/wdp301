// src/controller/report.controller.js

const { Report, UserViolation } = require('../../model'); // Đảm bảo đường dẫn tới models/index.js của bạn là đúng
const { validationResult, body } = require('express-validator');
const { detectSpamContent } = require('../../utils/contentFilter'); // Chúng ta sẽ tạo file này sau

// Hàm validation cho việc tạo báo cáo
const validateReportInput = [
    body('title')
        .notEmpty().withMessage('Tiêu đề báo cáo là bắt buộc.')
        .isLength({ max: 100 }).withMessage('Tiêu đề không được vượt quá 100 ký tự.'),
    body('description')
        .notEmpty().withMessage('Mô tả báo cáo là bắt buộc.')
        .isLength({ max: 1000 }).withMessage('Mô tả không được vượt quá 1000 ký tự.'),
    body('userId') // ID của người dùng gửi báo cáo (Clerk ID)
        .notEmpty().withMessage('ID người dùng gửi báo cáo là bắt buộc.'),
    body('reportType')
        .isIn(['item_feedback', 'user_behavior', 'spam']).withMessage('Loại báo cáo không hợp lệ.'),

    // Kiểm tra có điều kiện cho reportType
    body('itemId')
        .optional() // Là optional nếu không phải item_feedback
        .custom((value, { req }) => {
            if (req.body.reportType === 'item_feedback' && !value) {
                throw new Error('ID sản phẩm là bắt buộc cho loại báo cáo "phản hồi sản phẩm".');
            }
            // Nếu có value, kiểm tra định dạng ObjectId cơ bản
            if (value && !value.match(/^[0-9a-fA-F]{24}$/)) {
                throw new Error('ID sản phẩm không hợp lệ.');
            }
            return true;
        }),
    body('rating')
        .optional() // Là optional nếu không phải item_feedback
        .custom((value, { req }) => {
            if (req.body.reportType === 'item_feedback' && (value === undefined || value === null)) {
                throw new Error('Đánh giá số sao là bắt buộc cho loại báo cáo "phản hồi sản phẩm".');
            }
            if (value !== undefined && value !== null && (value < 1 || value > 5)) {
                throw new Error('Đánh giá số sao phải từ 1 đến 5.');
            }
            return true;
        }),
    body('reportedUserId')
        .optional() // Là optional nếu không phải user_behavior hoặc spam
        .custom((value, { req }) => {
            if ((req.body.reportType === 'user_behavior' || req.body.reportType === 'spam') && !value) {
                throw new Error('ID người dùng bị báo cáo là bắt buộc cho loại báo cáo "hành vi người dùng" hoặc "spam".');
            }
            return true;
        }),
];

/**
 * @desc    Tạo một báo cáo mới từ người dùng client
 * @route   POST /api/reports
 * @access  Private (Chỉ người dùng đã đăng nhập)
 */
const createReport = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const { title, description, userId, reportType, itemId, rating, reportedUserId } = req.body;

        // --- BƯỚC QUAN TRỌNG: CONTENT FILTERING ---
        // Gọi hàm kiểm tra nội dung spam/không phù hợp
        const isSpamDetected = await detectSpamContent(`${title} ${description}`); // Kết hợp cả tiêu đề và mô tả để kiểm tra

        if (isSpamDetected) {
            // Ghi lại vi phạm vào UserViolation
            await UserViolation.create({
                userId: userId, // ID của người dùng gửi báo cáo
                violationType: 'content_spam',
                description: `Nội dung báo cáo có thể chứa spam hoặc nội dung không phù hợp: "${title}" - "${description}"`,
                details: {
                    reportTitle: title,
                    reportDescription: description,
                    reportType: reportType,
                    reason: 'Content filtering flagged report as spam/inappropriate.'
                }
            });

            // Trả về lỗi 400 hoặc 429 tùy thuộc vào cách bạn muốn xử lý.
            // 400 Bad Request thường dùng cho lỗi đầu vào, 429 Too Many Requests cho rate limit.
            // Ở đây nội dung bị cấm thì 400 có vẻ hợp lý hơn.
            return res.status(400).json({
                success: false,
                message: 'Nội dung báo cáo bị từ chối do có thể chứa spam hoặc nội dung không phù hợp.',
                violationDetected: true // Cờ để client biết đây là lỗi vi phạm chính sách
            });
        }
        // --- KẾT THÚC CONTENT FILTERING ---

        const newReport = new Report({
            title,
            description,
            userId, // ID của người dùng gửi báo cáo
            reportType,
            itemId: reportType === 'item_feedback' ? itemId : undefined,
            rating: reportType === 'item_feedback' ? rating : undefined,
            reportedUserId: (reportType === 'user_behavior' || reportType === 'spam') ? reportedUserId : undefined,
            status: 'pending', // Mặc định là pending khi mới gửi
        });

        await newReport.save();

        res.status(201).json({
            success: true,
            message: 'Báo cáo của bạn đã được gửi thành công và đang chờ xét duyệt.',
            report: newReport
        });

    } catch (error) {
        console.error('Lỗi khi tạo báo cáo:', error);
        // Kiểm tra lỗi validation của Mongoose (ví dụ, thiếu trường required)
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({ success: false, message: 'Đã xảy ra lỗi máy chủ khi gửi báo cáo.' });
    }
};

module.exports = {
    createReport,
    validateReportInput
};