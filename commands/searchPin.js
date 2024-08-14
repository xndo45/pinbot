const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const {
    handleSearchPinByPin,
    handleSearchPinByUsername,
    handleSearchPinByRole
} = require('../helpers/searchPinHelper');
const {
    createErrorEmbed,
    createSuccessEmbed,
    createPaginatedSuccessEmbed,
    createPaginationButtons
} = require('../services/embedService');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('searchpin')
        .setDescription('Search for a pin by pin code, username, or role name')
        .addStringOption(option =>
            option.setName('pin')
                .setDescription('The pin code to search for'))
        .addStringOption(option =>
            option.setName('username')
                .setDescription('The username whose pins to search for'))
        .addStringOption(option =>
            option.setName('rolename')
                .setDescription('The role name to search for')),
    async execute(interaction) {
        try {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                const errorEmbed = createErrorEmbed(
                    'Permission Denied',
                    'You do not have the required role to use this command.'
                );
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                return;
            }

            const pin = interaction.options.getString('pin');
            const username = interaction.options.getString('username');
            const roleName = interaction.options.getString('rolename');

            if (!pin && !username && !roleName) {
                const errorEmbed = createErrorEmbed(
                    'Missing Arguments',
                    'Please provide either a pin, a username, or a role name.'
                );
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                return;
            }

            // Check if the pin contains any letters
            if (pin && containsLetters(pin)) {
                const errorEmbed = createErrorEmbed(
                    'Invalid Pin',
                    'The pin contains letters. Please use a valid numeric pin.'
                );
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                return;
            }

            await interaction.deferReply({ ephemeral: true });

            if (pin) {
                await handleSearchPinByPin(pin, interaction);
            } else if (username) {
                await handleSearchPinByUsername(username, interaction);
            } else if (roleName) {
                await handleSearchPinByRole(roleName, interaction);
            }
        } catch (error) {
            await handleError(interaction, error);
        }
    },
};

// Helper function to check if a string contains letters
function containsLetters(str) {
    return /[a-zA-Z]/.test(str);
}

async function handleError(interaction, error) {
    console.error('Error executing searchpin command:', error);

    const errorEmbed = createErrorEmbed(
        'Error',
        `An error occurred while searching for the pin: ${error.message}`
    );
    await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });

    const logChannel = interaction.guild.channels.cache.find(channel => channel.name === 'pin-log');
    if (logChannel) {
        const logEmbed = new EmbedBuilder()
            .setTitle('Error Executing Search')
            .setColor(0xFF0000)
            .setDescription(`An error occurred while searching for the pin:\n**Error:** ${error.message}\n**Performed By:** ${interaction.user.tag}\n**Performed At:** ${new Date().toLocaleString()}`);
        await logChannel.send({ embeds: [logEmbed] });
    }
}
