const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { inlineCode, bold, italic } = require('@discordjs/formatters');

/**
 * Creates an embed summarizing the audit report.
 * @param {number} totalExpiringPins - The total number of expiring pins.
 * @param {string} rolesSummaryText - A summary of roles and their expiring pins.
 * @returns {EmbedBuilder} - The embed summarizing the audit report.
 */
function createAuditSummaryEmbed(totalExpiringPins, rolesSummaryText) {
    return new EmbedBuilder()
        .setTitle(bold('Audit Report Summary'))  // Bold title text
        .setColor(0x00FF00)  // Green color for the embed
        .setDescription(italic('Here is the summary of expiring pins.'))  // Italic description text
        .addFields(
            { name: inlineCode('Total Expiring Pins'), value: `${totalExpiringPins}`, inline: false },
            { name: inlineCode('Roles Summary'), value: rolesSummaryText || 'No roles with expiring pins.', inline: false }
        )
        .setTimestamp();
}

/**
 * Creates buttons for each role to allow interaction.
 * @param {string[]} roles - An array of role names.
 * @returns {ActionRowBuilder} - A row of buttons for each role.
 */
function createRoleButtons(roles = []) {
    const buttons = roles.map(roleName => 
        new ButtonBuilder()
            .setCustomId(`viewRole-${roleName || 'N/A'}`) // Default to 'N/A' if roleName is null or undefined
            .setLabel(roleName ? `View ${roleName}` : 'No Role') // Label as 'No Role' if roleName is null or undefined
            .setStyle(ButtonStyle.Secondary)
    );

    // Always return an ActionRowBuilder, even if empty
    return new ActionRowBuilder().addComponents(buttons);
}

module.exports = {
    createAuditSummaryEmbed,
    createRoleButtons
};
