// Import all command handlers
const { execute: handleAddPinCommand } = require('./addpin');
const { execute: handleUpdateInfoCommand } = require('./updateinfo');
const { execute: handleUpdateExpiryCommand } = require('./updateexpiry');
const { execute: handleCheckSubscriptionCommand } = require('./checksubscription');
const { execute: handleDeletePinCommand } = require('./deletepin');
const { execute: handleSearchPinCommand } = require('./searchpin');
const { execute: handleViewPinsCommand } = require('./viewpins');
const { execute: handleAuditReportCommand } = require('./auditreport');  // Ensure consistent usage of 'execute'
const { handleRoleButtonInteraction } = require('./auditreport');       // Handle role button interaction separately
const { execute: handleServerConfigCommand } = require('./serverconfig');
const { execute: handleDashboardCommand } = require('./dashboard');
const { execute: handlePussioCommand } = require('./pussio');

// Export all command handlers as named exports
module.exports = {
    handleAddPinCommand,
    handleUpdateInfoCommand,
    handleUpdateExpiryCommand,
    handleCheckSubscriptionCommand,
    handleDeletePinCommand,
    handleSearchPinCommand,
    handleViewPinsCommand,
    handleAuditReportCommand,
    handleRoleButtonInteraction,
    handleServerConfigCommand,
    handleDashboardCommand,
    handlePussioCommand,
};
