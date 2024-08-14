const mongoose = require('mongoose');

const scheduledTaskSchema = new mongoose.Schema({
  taskId: { type: String, required: true, unique: true },
  taskName: { type: String, required: true },
  taskDetails: { type: mongoose.Schema.Types.Mixed },
  scheduledFor: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' }
});

// Indexes
scheduledTaskSchema.index({ taskId: 1 });
scheduledTaskSchema.index({ scheduledFor: 1 });

const ScheduledTask = mongoose.model('ScheduledTask', scheduledTaskSchema);

module.exports = ScheduledTask;
