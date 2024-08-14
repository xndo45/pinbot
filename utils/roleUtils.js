const Pin = require('../models/pinModel');

/**
 * Calculate the expiration date for a pin based on the role name.
 * @param {string} roleName - The name of the role.
 * @returns {Date|null} - The calculated expiration date or null if the role name is invalid.
 */
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

/**
 * Finds members in a role who do not have a corresponding pin.
 * @param {Guild} guild - The Discord guild (server).
 * @param {Role} role - The Discord role to check.
 * @returns {Array} - An array of members without pins.
 */
async function findMembersWithoutPins(guild, role) {
    const membersWithoutPins = [];

    await guild.members.fetch(); // Fetch all members
    const members = role.members;

    for (const member of members.values()) {
        const existingPin = await Pin.findOne({ userId: member.user.id, roleName: role.name });
        if (!existingPin) {
            membersWithoutPins.push({
                username: member.user.tag,
                userId: member.user.id,
            });
        }
    }

    return membersWithoutPins;
}

/**
 * Process role records for updating pins or creating new ones if they don't exist.
 * @param {Interaction} interaction - The Discord interaction object.
 * @param {string} roleId - The ID of the role to process.
 * @param {string} roleName - The name of the role.
 * @returns {Object} - Summary of the processing results.
 */
async function processRoleRecords(interaction, roleId, roleName) {
    let newRecords = 0;
    let updatedRecords = 0;
    let noUpdateNeeded = 0;
    let usersWithoutPins = [];

    const role = interaction.guild.roles.cache.get(roleId);
    const members = role.members;

    for (const member of members.values()) {
        const existingPin = await Pin.findOne({ userId: member.user.id, roleName });

        if (!existingPin) {
            usersWithoutPins.push({ username: member.user.tag, userId: member.user.id });

            const expirationDate = calculateExpirationDate(roleName);
            if (!expirationDate) {
                console.error(`Failed to calculate expiration date for role: ${roleName}`);
                continue;
            }

            const newPin = new Pin({
                pin: generateUniquePin(),
                userId: member.user.id,
                userTag: member.user.tag,
                roleName,
                roleId,
                expirationDate,
                status: expirationDate < new Date() ? 'expired' : 'active',
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            try {
                await newPin.save();
                newRecords++;
            } catch (error) {
                console.error(`Failed to save new pin for user ${member.user.tag}:`, error);
            }
        } else {
            let updateNeeded = false;

            if (existingPin.roleId !== roleId) {
                existingPin.roleId = roleId;
                updateNeeded = true;
            }

            const today = new Date();
            const status = existingPin.expirationDate < today ? 'expired' : 'active';
            if (existingPin.status !== status) {
                existingPin.status = status;
                updateNeeded = true;
            }

            if (updateNeeded) {
                existingPin.updatedAt = new Date();
                await existingPin.save();
                updatedRecords++;
            } else {
                noUpdateNeeded++;
            }
        }
    }

    return {
        newRecords,
        updatedRecords,
        noUpdateNeeded,
        usersWithoutPins,
        summary: `Processed ${members.size} members in the ${roleName} role.\n` +
            `${newRecords} new records created, ${updatedRecords} records updated, ${noUpdateNeeded} did not need updates.`
    };
}

module.exports = { processRoleRecords, findMembersWithoutPins };
