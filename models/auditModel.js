const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    pin: { type: String }, // Make this field optional
    action: { type: String, required: true }, // e.g., 'add', 'delete', 'update'
    performedBy: { type: String,}, // Change to String to store Discord User ID
    performedAt: { type: Date, default: Date.now },
    details: { type: mongoose.Schema.Types.Mixed } // Structured data for additional details
});

// Indexes
auditLogSchema.index({ pin: 1 });
auditLogSchema.index({ performedBy: 1 });
auditLogSchema.index({ pin: 1, performedAt: 1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
