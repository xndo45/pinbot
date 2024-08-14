const Pin = require('../models/pinModel');
const AuditLog = require('../models/auditModel');
const ServerConfig = require('../models/serverModel');

// Add a new pin to the database
async function addPin(pinData, performedBy) {
    try {
        const existingPin = await Pin.findOne({ userId: pinData.userId });
        if (existingPin) {
            throw new Error('A pin already exists for this user.');
        }

        const pin = new Pin(pinData);
        await pin.save();

        await logAuditAction('add', pinData.pin, performedBy, pinData);
        return pin;
    } catch (error) {
        console.error('Error adding pin:', error.message);
        throw error;
    }
}

// Update pin information in the database
async function updatePinInfo({ pin, userId, userTag, roleName, roleId }) {
    try {
        const pinData = await Pin.findOne({ pin, userId, userTag });
        if (!pinData) {
            throw new Error('No pin found for the provided user tag or ID.');
        }

        const oldData = {
            roleName: pinData.roleName,
            expirationDate: pinData.expirationDate,
        };

        const newExpirationDate = calculateExpirationDate(roleName);
        if (!newExpirationDate) {
            throw new Error('Invalid role name provided.');
        }

        // Update fields only if they have changed
        pinData.roleName = roleName && pinData.roleName !== roleName ? roleName : pinData.roleName;
        pinData.roleId = roleId && pinData.roleId !== roleId ? roleId : pinData.roleId;
        pinData.expirationDate = newExpirationDate;
        pinData.updatedAt = new Date();

        await pinData.save();

        const newData = {
            roleName: pinData.roleName,
            expirationDate: pinData.expirationDate,
        };

        await logAuditAction('update', pinData.pin, userId, { oldData, newData });
        return { oldData, newData };
    } catch (error) {
        console.error('Error updating pin info:', error.message);
        throw error;
    }
}

// Update the expiration date of a pin
async function updateExpiry(pin, userTag, newDate, performedBy) {
    try {
        const pinData = await findPinByCriteria({ pin, userTag });
        if (!pinData) {
            throw new Error('No pin found for the provided criteria.');
        }

        const oldData = {
            roleName: pinData.roleName,
            expirationDate: pinData.expirationDate,
        };

        pinData.expirationDate = new Date(newDate);
        pinData.roleId = pinData.roleId || 'defaultRoleId';
        pinData.roleName = pinData.roleName || 'defaultRoleName';

        await pinData.save();

        const newData = {
            roleName: pinData.roleName,
            expirationDate: pinData.expirationDate,
        };

        await logAuditAction('updateExpiry', pinData.pin, performedBy, { oldData, newData });
        return { oldData, newData };
    } catch (error) {
        console.error('Error updating pin expiry:', error.message);
        throw error;
    }
}

// Find pins by username
async function findPinsByUsername(username) {
    try {
        return await Pin.find({ userTag: username });
    } catch (error) {
        console.error('Error finding pins by username:', error.message);
        throw error;
    }
}

// Find pins by user ID
async function findPinsByUserId(userId) {
    try {
        const pins = await Pin.find({ userId });
        if (pins.length === 0) {
            console.warn(`No pins found for user ID: ${userId}`);
        }
        return pins;
    } catch (error) {
        console.error('Error finding pins by user ID:', error.message);
        throw error;
    }
}

// Delete a pin by pin code
async function deletePin(pin, performedBy) {
    try {
        const deletedPin = await Pin.findOneAndDelete({ pin });
        if (!deletedPin) {
            throw new Error('No pin found to delete.');
        }

        await logAuditAction('delete', pin, performedBy, deletedPin);
        return deletedPin;
    } catch (error) {
        console.error('Error deleting pin:', error.message);
        throw error;
    }
}

// Delete all pins by user tag
async function deletePinsByUserTag(userTag, performedBy) {
    try {
        const result = await Pin.deleteMany({ userTag });
        await logAuditAction('delete', null, performedBy, { userTag, deletedCount: result.deletedCount });
        return result.deletedCount;
    } catch (error) {
        console.error('Error deleting pins by user tag:', error.message);
        throw error;
    }
}

// Search for pins based on criteria
async function searchPins(criteria) {
    try {
        return await Pin.find(criteria);
    } catch (error) {
        console.error('Error searching pins:', error.message);
        throw error;
    }
}

// View pins by user tag
async function viewPins(userTag) {
    try {
        return await Pin.find({ userTag });
    } catch (error) {
        console.error('Error viewing pins:', error.message);
        throw error;
    }
}

// Get server configuration by server ID
async function getServerConfig(serverId) {
    try {
        const config = await ServerConfig.findOne({ serverId });
        if (!config) {
            throw new Error('Server configuration not found.');
        }
        return config;
    } catch (error) {
        console.error('Error getting server config:', error.message);
        throw error;
    }
}

// Get pins expiring within 30 days
async function getExpiringPins() {
    try {
        const today = new Date();
        const thirtyDaysFromNow = new Date(today);
        thirtyDaysFromNow.setDate(today.getDate() + 30);

        return await Pin.find({
            expirationDate: {
                $gte: today,
                $lte: thirtyDaysFromNow,
            },
        });
    } catch (error) {
        console.error('Error getting expiring pins:', error.message);
        throw error;
    }
}

// Helper function to calculate expiration date based on role name
function calculateExpirationDate(roleName) {
    let newExpirationDate = new Date();
    switch (roleName.toLowerCase()) {
        case 'special 1m':
            newExpirationDate.setDate(newExpirationDate.getDate() + 30);
            break;
        case 'special 3m':
            newExpirationDate.setDate(newExpirationDate.getDate() + 90);
            break;
        case 'special 1y':
            newExpirationDate.setDate(newExpirationDate.getDate() + 365);
            break;
        case 'special lifetime':
            newExpirationDate = new Date('2099-12-31');
            break;
        default:
            console.warn(`Invalid role name provided: ${roleName}`);
            return null;
    }
    return newExpirationDate;
}

// Helper function to log audit actions
async function logAuditAction(action, pin, performedBy, details) {
    try {
        const auditLog = new AuditLog({
            pin,
            action,
            performedBy,
            details,
            timestamp: new Date(), // Adding timestamp for better tracking
        });
        await auditLog.save();
    } catch (error) {
        console.error('Error logging audit action:', error.message);
        throw error;
    }
}

// Helper function to find a pin by criteria (either pin or userTag)
async function findPinByCriteria(criteria) {
    const { pin, userTag } = criteria;
    if (!pin && !userTag) {
        throw new Error('No criteria provided for finding a pin.');
    }
    return await Pin.findOne({ $or: [{ pin }, { userTag }] });
}

module.exports = {
    addPin,
    updatePinInfo,
    updateExpiry,
    findPinsByUserId,
    findPinsByUsername,
    deletePin,
    deletePinsByUserTag,
    searchPins,
    viewPins,
    getServerConfig,
    getExpiringPins,
};
