// src/controller/report.controller.js

const { Report, UserViolation } = require('../../model');
const { validationResult, body } = require('express-validator');
const { detectSpamContent } = require('../../utils/contentFilter');
const { clerkClient } = require('@clerk/clerk-sdk-node'); // Thêm dòng này

// Hàm validation cho việc tạo báo cáo
const validateReportInput = [
    body('title')
        .notEmpty().withMessage('Tiêu đề báo cáo là bắt buộc.')
        .isLength({ max: 100 }).withMessage('Tiêu đề không được vượt quá 100 ký tự.'),
    body('description')
        .notEmpty().withMessage('Mô tả báo cáo là bắt buộc.')
        .isLength({ max: 1000 }).withMessage('Mô tả không được vượt quá 1000 ký tự.'),
    body('userId')
        .notEmpty().withMessage('ID người dùng gửi báo cáo là bắt buộc.'),
    body('reportType')
        .isIn(['item_feedback', 'user_behavior', 'spam']).withMessage('Loại báo cáo không hợp lệ.'),

    body('itemId')
        .optional()
        .custom((value, { req }) => {
            if (req.body.reportType === 'item_feedback' && !value) {
                throw new Error('ID sản phẩm là bắt buộc cho loại báo cáo "phản hồi sản phẩm".');
            }
            if (value && !value.match(/^[0-9a-fA-F]{24}$/)) {
                throw new Error('ID sản phẩm không hợp lệ.');
            }
            return true;
        }),

    body('rating')
        .optional()
        .custom((value, { req }) => {
            if (req.body.reportType === 'item_feedback' && (value === undefined || value === null)) {
                throw new Error('Đánh giá số sao là bắt buộc.');
            }
            if (value !== undefined && (value < 1 || value > 5)) {
                throw new Error('Đánh giá số sao phải từ 1 đến 5.');
            }
            return true;
        }),

    body('reportedUserEmail')
        .optional()
        .custom((value, { req }) => {
            if ((req.body.reportType === 'user_behavior' || req.body.reportType === 'spam') && !value) {
                throw new Error('Email người dùng bị báo cáo là bắt buộc.');
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (value && !emailRegex.test(value)) {
                throw new Error('Địa chỉ email không hợp lệ.');
            }
            return true;
        }),
];


// Controller chính
const createReport = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const { title, description, userId, reportType, itemId, rating, reportedUserEmail } = req.body;

        // Content Filtering
        const isSpamDetected = await detectSpamContent(`${title} ${description}`);
        if (isSpamDetected) {
            await UserViolation.create({
                userId,
                violationType: 'content_spam',
                description: `Nội dung báo cáo có thể chứa spam hoặc nội dung không phù hợp: "${title}" - "${description}"`,
                details: {
                    reportTitle: title,
                    reportDescription: description,
                    reportType,
                    reason: 'Content filtering flagged report as spam/inappropriate.'
                }
            });

            return res.status(400).json({
                success: false,
                message: 'Nội dung báo cáo bị từ chối do có thể chứa spam hoặc nội dung không phù hợp.',
                violationDetected: true
            });
        }

        // 🔍 Nếu là báo cáo người dùng → Tra email sang Clerk ID
        let resolvedReportedUserId = undefined;
        if ((reportType === 'user_behavior' || reportType === 'spam') && reportedUserEmail) {
            const users = await clerkClient.users.getUserList({ emailAddress: [reportedUserEmail] });

            if (!users || users.length === 0) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng với email này.' });
            }

            resolvedReportedUserId = users[0].id;
        }

        // Tạo báo cáo mới
        const newReport = new Report({
            title,
            description,
            userId,
            reportType,
            itemId: reportType === 'item_feedback' ? itemId : undefined,
            rating: reportType === 'item_feedback' ? rating : undefined,
            reportedUserId: resolvedReportedUserId,
            status: 'pending',
        });

        await newReport.save();

        res.status(201).json({
            success: true,
            message: 'Báo cáo của bạn đã được gửi thành công và đang chờ xét duyệt.',
            report: newReport
        });

    } catch (error) {
        console.error('Lỗi khi tạo báo cáo:', error);
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
