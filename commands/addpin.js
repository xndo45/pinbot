const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField } = require('discord.js');
const { addPin, findPinsByUsername } = require('../utils/mongoHelper');
const { createErrorEmbed, createPinAddedEmbed, createSuccessEmbed } = require('../services/embedService');
const { logAuditAction } = require('../utils/auditLogger');

const ROLES = {
    SPECIAL_1M: 'Special 1m',
    SPECIAL_3M: 'Special 3m',
    SPECIAL_1Y: 'Special 1y',
    SPECIAL_LIFETIME: 'Special Lifetime',
    ACTIVATION: 'Activation'
};

const EXPIRATION_DATES = {
    [ROLES.SPECIAL_1M]: 30,
    [ROLES.SPECIAL_3M]: 90,
    [ROLES.SPECIAL_1Y]: 365,
    [ROLES.SPECIAL_LIFETIME]: new Date('2099-12-31')
};

function calculateExpirationDate(roleName) {
    if (roleName === ROLES.SPECIAL_LIFETIME) {
        return EXPIRATION_DATES[ROLES.SPECIAL_LIFETIME];
    }
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + EXPIRATION_DATES[roleName]);
    return expirationDate;
}

async function logActivity(interaction, title, description, color = 0x00FF00) {
    const logChannel = interaction.guild.channels.cache.find(channel => channel.name === 'pin-log');
    if (logChannel) {
        const logEmbed = createSuccessEmbed(title, description, [
            { name: 'Performed By', value: interaction.user.tag }
        ]);
        await logChannel.send({ embeds: [logEmbed] });
    }
}

async function removeActivationRole(interaction, user) {
    const activationRole = interaction.guild.roles.cache.find(r => r.name === ROLES.ACTIVATION);
    if (activationRole && user.roles.cache.has(activationRole.id)) {
        await user.roles.remove(activationRole);
        return true;
    }
    return false;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addpin')
        .setDescription('Add a pin code')
        .addSubcommand(subcommand =>
            subcommand
                .setName('admin')
                .setDescription('Admin: Add a new pin with user and role details')
                .addStringOption(option =>
                    option.setName('pin')
                        .setDescription('The pin code')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('usertag')
                        .setDescription('The user tag')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('rolename')
                        .setDescription('The role name')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('user')
                .setDescription('User: Add a new pin')
                .addStringOption(option =>
                    option.setName('pin')
                        .setDescription('The pin code')
                        .setRequired(true))),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'admin') {
            await handleAdminAddPin(interaction);
        } else if (subcommand === 'user') {
            await handleUserAddPin(interaction);
        }
    }
};

async function handleAdminAddPin(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        await interaction.reply({ embeds: [createErrorEmbed('Permission Denied', 'You are not authorized to use this command!')], ephemeral: true });
        return;
    }

    const pin = interaction.options.getString('pin');
    const userTag = interaction.options.getString('usertag');
    const roleName = interaction.options.getString('rolename');

    const existingPins = await findPinsByUsername(userTag);
    if (existingPins.length > 0) {
        await interaction.reply({ embeds: [createErrorEmbed('Pin Exists', `User ${userTag} already has a pin assigned.`)], ephemeral: true });
        return;
    }

    const role = interaction.guild.roles.cache.find(r => r.name.toLowerCase() === roleName.toLowerCase());
    if (!role) {
        await interaction.reply({ embeds: [createErrorEmbed('Invalid Role', 'Invalid role name provided.')], ephemeral: true });
        return;
    }

    const expirationDate = calculateExpirationDate(roleName);
    if (!expirationDate) {
        await interaction.reply({ embeds: [createErrorEmbed('Invalid Role', 'Invalid role name provided.')], ephemeral: true });
        return;
    }

    try {
        await addPin({ pin, userTag, userId: interaction.user.id, roleName, roleId: role.id, expirationDate });

        const user = await interaction.guild.members.fetch(interaction.user.id);
        const removed = await removeActivationRole(interaction, user);

        await interaction.reply({ embeds: [createPinAddedEmbed(pin, roleName, expirationDate, userTag)], ephemeral: true });

        const logMessage = `**Pin:** ${pin}\n**User:** ${userTag}\n**Role:** ${roleName}\n**Expires:** ${expirationDate}` + (removed ? `\n**Activation Role Removed:** Yes` : '');
        await logActivity(interaction, 'Pin Added', logMessage);

        // Also log using the audit logger
        await logAuditAction('add', pin, interaction.user.id, { roleName, expirationDate });

    } catch (error) {
        await interaction.reply({ embeds: [createErrorEmbed('Error Adding Pin', `An error occurred: ${error.message}`)], ephemeral: true });
        await logActivity(interaction, 'Error Adding Pin', `**Pin:** ${pin}\n**User:** ${userTag}\n**Error:** ${error.message}`, 0xFF0000);
    }
}

async function handleUserAddPin(interaction) {
    const pin = interaction.options.getString('pin');
    const userTag = interaction.user.tag;

    const existingPins = await findPinsByUsername(userTag);
    if (existingPins.length > 0) {
        await interaction.reply({ embeds: [createErrorEmbed('Pin Exists', 'You already have a pin assigned.')], ephemeral: true });
        return;
    }

    const user = await interaction.guild.members.fetch(interaction.user.id);
    const userRoles = user.roles.cache;

    const role = Object.values(ROLES).find(role => userRoles.some(r => r.name === role));
    if (!role) {
        await interaction.reply({ embeds: [createErrorEmbed('Invalid Role', 'You do not have a valid role to add a pin.')], ephemeral: true });
        return;
    }

    const expirationDate = calculateExpirationDate(role);
    const roleId = userRoles.find(r => r.name === role).id;

    try {
        await addPin({ pin, userTag, userId: interaction.user.id, roleName: role, roleId, expirationDate });

        const removed = await removeActivationRole(interaction, user);

        await interaction.reply({ embeds: [createPinAddedEmbed(pin, role, expirationDate, userTag)], ephemeral: true });

        const logMessage = `**Pin:** ${pin}\n**User:** ${userTag}\n**Role:** ${role}\n**Expires:** ${expirationDate}` + (removed ? `\n**Activation Role Removed:** Yes` : '');
        await logActivity(interaction, 'Pin Added', logMessage);

        // Also log using the audit logger
        await logAuditAction('add', pin, interaction.user.id, { roleName: role, expirationDate });

    } catch (error) {
        await interaction.reply({ embeds: [createErrorEmbed('Error Adding Pin', `An error occurred: ${error.message}`)], ephemeral: true });
        await logActivity(interaction, 'Error Adding Pin', `**Pin:** ${pin}\n**User:** ${userTag}\n**Error:** ${error.message}`, 0xFF0000);
    }
}
