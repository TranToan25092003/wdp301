// src/controller/report.controller.js

const { Report, UserViolation } = require('../../model');
const ActivityLog = require('../../model/ActivityLog.model'); // Thêm dòng này để import ActivityLog
const { validationResult, body } = require('express-validator');
const { detectSpamContent } = require('../../utils/contentFilter');
const { clerkClient } = require('@clerk/clerk-sdk-node');

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
        .custom(async (value, { req }) => { // THÊM async vì cần await clerkClient
            if ((req.body.reportType === 'user_behavior' || req.body.reportType === 'spam') && !value) {
                throw new Error('Email người dùng bị báo cáo là bắt buộc.');
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (value && !emailRegex.test(value)) {
                throw new Error('Địa chỉ email không hợp lệ.');
            }

            // Lấy ID của người dùng hiện tại từ req.body.userId (người gửi báo cáo)
            const currentUserId = req.body.userId;
            if (!currentUserId) {
                throw new Error('Không tìm thấy ID người dùng gửi báo cáo.');
            }
            
            // Tìm kiếm người dùng bằng email bị báo cáo
            if (value) {
                const users = await clerkClient.users.getUserList({ emailAddress: [value] });
                if (users && users.length > 0) {
                    const reportedUserId = users[0].id;
                    // So sánh ID của người gửi báo cáo với ID của người bị báo cáo
                    if (currentUserId === reportedUserId) {
                        throw new Error('Bạn không thể báo cáo chính mình.');
                    }
                }
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
            const userViolationDoc = await UserViolation.create({ // Ghi lại UserViolation
                userId,
                violationType: 'content_spam', // Đảm bảo giá trị này hợp lệ
                description: `Nội dung báo cáo có thể chứa spam hoặc nội dung không phù hợp: "${title}" - "${description}"`,
                payload: { // Sử dụng 'payload' thay vì 'details' để nhất quán với schema UserViolation
                    reportTitle: title,
                    reportDescription: description,
                    reportType,
                    reason: 'Content filtering flagged report as spam/inappropriate.',
                    ipAddress: req.ip,
                    userAgent: req.headers['user-agent'],
                }
            });

            // Ghi log hoạt động khi phát hiện spam và tạo UserViolation
            await ActivityLog.create({
                userId: userId, // Người dùng có hành vi spam
                actionType: 'USER_VIOLATION_CREATED',
                description: `Tự động tạo bản ghi vi phạm cho người dùng ${userId} do nội dung báo cáo bị gắn cờ spam.`,
                entityType: 'UserViolation',
                entityId: userViolationDoc._id, // Liên kết với bản ghi UserViolation vừa tạo
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
                payload: {
                    violationId: userViolationDoc._id,
                    violationType: userViolationDoc.violationType,
                    flaggedReportTitle: title,
                    flaggedReportDescription: description,
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
            
            // THÊM LOGIC KIỂM TRA NGƯỜI DÙNG TỰ BÁO CÁO MÌNH Ở BACKEND
            if (userId === resolvedReportedUserId) {
                return res.status(400).json({ success: false, message: 'Bạn không thể báo cáo chính mình.' });
            }
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

        // Ghi log hoạt động khi tạo báo cáo thành công
        await ActivityLog.create({
            userId: userId, // Người dùng gửi báo cáo
            actionType: 'USER_REPORTED', // Hoặc 'REPORT_CREATED' nếu bạn muốn một actionType cụ thể hơn
            description: `Người dùng ${userId} đã gửi một báo cáo (${reportType}) với tiêu đề: "${title}".`,
            entityType: 'Report',
            entityId: newReport._id, // Liên kết với bản ghi báo cáo vừa tạo
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            payload: {
                reportId: newReport._id,
                reportType: newReport.reportType,
                reportedUserId: newReport.reportedUserId,
                itemId: newReport.itemId,
            },
        });


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