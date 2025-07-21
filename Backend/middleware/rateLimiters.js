const rateLimit = require('express-rate-limit');
const UserViolation = require('../model/userViolation.model');
const Report = require('../model/report.model');

const createAutoReport = async (userId, violationType, description, payload) => {
  try {
   
    const reportedUserId = userId !== 'unknown' ? userId : `IP_${payload.ip}`;
  
    const report = await Report.create({
      title: 'Hệ thống: Phát hiện hành vi spam',
      description: `Báo cáo tự động: Người dùng đã vượt quá giới hạn đăng bài (3 bài trong 1 phút), có dấu hiệu spam.`,
      userId: null,
      reportType: 'system_generated_violation',
      reportedUserId: reportedUserId,
      status: 'pending',
      createdAt: new Date(),
      payload: {
        ip: payload.ip,
        userAgent: payload.userAgent,
        path: payload.path,
      },
    });
    console.log(`Auto-reported user ${userId} for spam behavior. Report ID: ${report._id}`);
    return report;
  } catch (error) {
    console.error('Error in createAutoReport:', error);
    throw error;
  }
};

const onLimitReached = async (req, res, options) => {

  const userId = req.userId || 'unknown'; // Dùng req.userId thay vì req.auth.userId
  const userIp = req.ip;



  try {
    const violation = await UserViolation.create({
      userId: userId,
      violationType: 'rate_limit_exceeded',
      description: `Vượt quá giới hạn tần suất: ${options.max} yêu cầu trong ${options.windowMs / 1000} giây.`,
      payload: {
        ip: userIp,
        userAgent: req.headers['user-agent'],
        path: req.path,
        limit: options.max,
        windowMs: options.windowMs,
      },
      status: 'pending',
    });
    console.log(`Violation recorded for user ${userId}. Violation ID: ${violation._id}`);

    await createAutoReport(
      userId,
      'rate_limit_exceeded',
      violation.description,
      violation.payload
    );
  } catch (error) {
    console.error('Error recording rate limit violation:', error);
  }

  const statusCode = options.statusCode || 429;
  res.status(statusCode).json({
    success: false,
    message: options.message || 'Bạn đang đăng tin quá nhanh. Vui lòng đợi một lát rồi thử lại.',
    violationDetected: true,
  });
};

exports.createItemLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 2,
  message: 'Bạn đang đăng tin quá nhanh. Vui lòng đợi một lát rồi thử lại.',
  statusCode: 429,
  handler: onLimitReached,
  keyGenerator: (req) => req.userId || req.ip, // Dùng req.userId thay vì req.auth.userId
});

exports.submitReportLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 4,
  message: 'Bạn đang gửi báo cáo quá thường xuyên. Vui lòng đợi một lát rồi thử lại.',
  statusCode: 429,
  handler: onLimitReached,
  keyGenerator: (req) => req.userId || req.ip,
});