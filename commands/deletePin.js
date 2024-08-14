const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const { deletePin, deletePinsByUserTag } = require('../utils/mongoHelper');
const { createErrorEmbed, createSuccessEmbed } = require('../services/embedService');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deletepin')
        .setDescription('Delete pin codes')
        .addStringOption(option =>
            option.setName('pin')
                .setDescription('The pin code to delete')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('usertag')
                .setDescription('The user tag whose pins to delete')
                .setRequired(false)),
    async execute(interaction) {
        try {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                const errorEmbed = createErrorEmbed('Permission Denied', 'You do not have the required role to use this command.');
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                return;
            }

            const pin = interaction.options.getString('pin');
            const usertag = interaction.options.getString('usertag');

            if (!pin && !usertag) {
                const errorEmbed = createErrorEmbed('Missing Arguments', 'Please provide either a pin or a user tag to delete pins.');
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                return;
            }

            let successEmbed;
            if (pin) {
                const deletedPin = await deletePin(pin, interaction.user.id);
                if (!deletedPin) {
                    const noPinEmbed = createErrorEmbed('No Pin Found', `No pin found with the code: ${pin}`);
                    await interaction.reply({ embeds: [noPinEmbed], ephemeral: true });
                    return;
                }
                successEmbed = createSuccessEmbed('Pin Deleted', `Pin code ${pin} deleted successfully.`);
            } else if (usertag) {
                const deletedCount = await deletePinsByUserTag(usertag, interaction.user.id);
                if (deletedCount === 0) {
                    const noPinsEmbed = createErrorEmbed('No Pins Found', `No pins found for user tag: ${usertag}`);
                    await interaction.reply({ embeds: [noPinsEmbed], ephemeral: true });
                    return;
                }
                successEmbed = createSuccessEmbed('Pins Deleted', `Deleted ${deletedCount} pins for user ${usertag}.`);
            }

            await interaction.reply({ embeds: [successEmbed], ephemeral: true });
            await logDeletion(interaction, pin, usertag, 'success');

        } catch (error) {
            console.error('Error deleting pin(s):', error);
            if (!interaction.replied && !interaction.deferred) {
                const errorEmbed = createErrorEmbed('Error Deleting Pin(s)', `An error occurred while deleting the pin(s): ${error.message}`);
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
            await logDeletion(interaction, null, null, 'error', error.message);
        }
    }
};

async function logDeletion(interaction, pin, usertag, status, errorMessage = null) {
    const logChannel = interaction.guild.channels.cache.find(channel => channel.name === 'pin-log');
    if (!logChannel) {
        console.warn('Log channel not found.');
        return;
    }

    const logEmbed = new EmbedBuilder()
        .setTitle(status === 'success' ? 'Pin(s) Deleted' : 'Error Deleting Pin(s)')
        .setColor(status === 'success' ? 0x00FF00 : 0xFF0000)
        .setDescription(status === 'success' 
            ? `**Action:** Delete\n**Type:** ${pin ? 'Pin' : 'User'}\n**Value:** ${pin || usertag}\n**Deleted By:** ${interaction.user.tag}\n**Deleted At:** ${new Date().toLocaleString()}`
            : `An error occurred while deleting the pin(s):\n**Action:** Delete\n**Type:** ${pin ? 'Pin' : 'User'}\n**Value:** ${pin || usertag}\n**Error:** ${errorMessage}\n**Performed By:** ${interaction.user.tag}\n**Performed At:** ${new Date().toLocaleString()}`
        );

    await logChannel.send({ embeds: [logEmbed] });
}
