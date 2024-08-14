const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField } = require('discord.js');
const { updateExpiry, findPinsByUsername } = require('../utils/mongoHelper');
const { createErrorEmbed, createSuccessEmbed } = require('../services/embedService');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('updateexpiry')
        .setDescription('Update the expiry date of a pin')
        .addStringOption(option =>
            option.setName('pin')
                .setDescription('The pin code')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('usertag')
                .setDescription('The user tag associated with the pin')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('date')
                .setDescription('The new expiration date (YYYY-MM-DD)')
                .setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            await interaction.reply({ embeds: [createErrorEmbed('Permission Denied', 'You are not authorized to use this command!')], ephemeral: true });
            return;
        }

        const pin = interaction.options.getString('pin');
        const userTag = interaction.options.getString('usertag');
        const date = interaction.options.getString('date');
        const userId = interaction.user.id;

        if (!pin && !userTag) {
            await interaction.reply({ embeds: [createErrorEmbed('Invalid Input', 'You must provide either a pin or a user tag to update.')], ephemeral: true });
            return;
        }

        if (!isValidDate(date)) {
            await interaction.reply({ embeds: [createErrorEmbed('Invalid Date Format', 'The date provided is not in a valid format (YYYY-MM-DD).')], ephemeral: true });
            return;
        }

        // Check if the pin contains any letters
        if (pin && containsLetters(pin)) {
            await interaction.reply({ embeds: [createErrorEmbed('Invalid Pin', 'The pin contains letters. Please use a valid numeric pin.')], ephemeral: true });
            return;
        }

        try {
            const { oldData, newData } = await updateExpiry(pin, userTag, date, userId);
            await interaction.reply({
                embeds: [createExpiryUpdateEmbed(oldData, newData)],
                ephemeral: true
            });
            await logAction(interaction, pin, userTag, oldData, newData);
        } catch (error) {
            console.error('Error updating pin expiry:', error);
            await interaction.reply({ embeds: [createErrorEmbed('Error Updating Pin Expiry', `An error occurred while updating the pin expiry: ${error.message}`)], ephemeral: true });
        }
    }
};

// Helper function to validate the date format
function isValidDate(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateString.match(regex)) return false;

    const date = new Date(dateString);
    const timestamp = date.getTime();

    return timestamp && date.toISOString().startsWith(dateString);
}

// Helper function to check if a string contains letters
function containsLetters(str) {
    return /[a-zA-Z]/.test(str);
}

// Helper function to create the success embed for expiry update
function createExpiryUpdateEmbed(oldData, newData) {
    return createSuccessEmbed('Pin Expiry Updated', 'The expiration date has been successfully updated.', [
        { name: 'Old Expiration Date', value: oldData.expirationDate.toDateString(), inline: true },
        { name: 'New Expiration Date', value: newData.expirationDate.toDateString(), inline: true }
    ]);
}

// Helper function to log the action
async function logAction(interaction, pin, userTag, oldData, newData) {
    const logChannel = interaction.guild.channels.cache.find(channel => channel.name === 'pin-log');
    if (logChannel) {
        const logEmbed = createSuccessEmbed('Pin Expiry Updated', `**Pin:** ${pin || 'N/A'}\n**User Tag:** ${userTag || 'N/A'}\n**Old Expiration Date:** ${oldData.expirationDate.toDateString()}\n**New Expiration Date:** ${newData.expirationDate.toDateString()}`);
        await logChannel.send({ embeds: [logEmbed] });
    }
}
