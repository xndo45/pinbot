const AuditLog = require('../models/auditModel');

async function logAuditAction(action, pin, performedBy, details) {
    try {
        // Log the values to verify they are being passed correctly
        console.log(`Logging action: ${action}, Pin: ${pin}, Performed By: ${performedBy}, Details: ${JSON.stringify(details)}`);

        const auditLog = new AuditLog({
            action,
            pin,
            performedBy, // Ensure this is being set
            details,
            performedAt: new Date(), // Optional: You can rely on the default
        });

        await auditLog.save();
        console.log('Audit log saved successfully.');
    } catch (error) {
        console.error('Error logging audit action:', error.message);
        throw error;
    }
}

module.exports = {
    logAuditAction,
};
