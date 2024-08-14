const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  sendAt: { type: Date, required: true },
  isSent: { type: Boolean, default: false },
  type: { type: String, enum: ['general', 'alert', 'reminder'], default: 'general' },
  priority: { type: Number, enum: [0, 1, 2], default: 0 }, // 0: Low, 1: Medium, 2: High
  status: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' }
});

// Indexes
notificationSchema.index({ userId: 1 });
notificationSchema.index({ sendAt: 1 });
notificationSchema.index({ status: 1, sendAt: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
