const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        sender: { type: String, default: 'System' },
        receiver: { type: String, required: [true, 'Receiver is required'] },
        type: { type: String, required: [true, 'Type is required'] },
        content: { type: String, required: [true, 'Content is required'] },
        link: { type: String, required: [true, 'Link is required'] },
        isRead: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// ✅ Tránh lỗi overwrite khi model đã tồn tại
const Notification = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);

module.exports = Notification;
