// commands/checksubscription.js

const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const { findPinsByUsername } = require('../utils/mongoHelper');
const { createSuccessEmbed, createErrorEmbed } = require('../services/embedService');

async function handleCheckSubscriptionCommand(interaction) {
    // Ensure the user has the correct permissions
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        const errorEmbed = createErrorEmbed('Permission Denied', 'You do not have the required permissions to use this command.');
        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        return;
    }

    const username = interaction.options.getString('username');

    try {
        // Fetch pins by username
        const pins = await findPinsByUsername(username);

        if (!pins || pins.length === 0) {
            await handleNoSubscription(interaction, username);
        } else {
            await handleSubscriptionFound(interaction, username, pins);
        }
    } catch (error) {
        await handleError(interaction, username, error);
    }
}

// Helper functions
async function handleNoSubscription(interaction, username) {
    const errorEmbed = createErrorEmbed('No Subscription', `No pins found for user **${username}**.`);
    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });

    await logToChannel(interaction, {
        title: 'No Subscription Found',
        color: 0xFF0000,
        description: `No pins found for user **${username}**.`,
    });
}

async function handleSubscriptionFound(interaction, username, pins) {
    const pinList = pins.map(pin => `**${pin.pin}** - Expires: ${pin.expirationDate.toDateString()}`).join('\n');
    const successEmbed = createSuccessEmbed('Subscription Status', `**Pins for user ${username}:**\n${pinList}`);
    await interaction.reply({ embeds: [successEmbed], ephemeral: true });

    await logToChannel(interaction, {
        title: 'Subscription Status Checked',
        color: 0x00FF00,
        description: `**User:** ${username}\n**Pins:**\n${pinList}`,
    });
}

async function handleError(interaction, username, error) {
    const errorEmbed = createErrorEmbed('Error', `Failed to retrieve pins for user **${username}**.`);
    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });

    await logToChannel(interaction, {
        title: 'Error Checking Subscription',
        color: 0xFF0000,
        description: `Failed to retrieve pins for user **${username}**.\n**Error:** ${error.message}`,
    });

    console.error('Error checking subscription:', error);
}

async function logToChannel(interaction, { title, color, description }) {
    const logChannel = interaction.guild.channels.cache.find(channel => channel.name === 'pin-log');
    if (logChannel) {
        const logEmbed = new EmbedBuilder()
            .setTitle(title)
            .setColor(color)
            .setDescription(`${description}\n**Checked By:** ${interaction.user.tag}\n**Checked At:** ${new Date().toLocaleString()}`);
        await logChannel.send({ embeds: [logEmbed] });
    } else {
        console.warn('Log channel not found.');
    }
}

// Export the command function
module.exports = {
    data: new SlashCommandBuilder()
        .setName('checksubscription')
        .setDescription('Check the subscription status of a user')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('The username to check')
                .setRequired(true)),
    execute: handleCheckSubscriptionCommand, // Ensure 'execute' is properly set
};
