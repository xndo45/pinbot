// utils/permissionHelper.js
const { allowedUserIds } = require('./allowedUsers');

function hasPermission(userId) {
    return allowedUserIds.includes(userId);
}

module.exports = { hasPermission };
