const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const { bold, inlineCode, hyperlink } = require('@discordjs/formatters');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dashboard')
        .setDescription('Displays the activation dashboard')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        // Introduction Embed (Static)
        const introEmbed = new EmbedBuilder()
            .setTitle(bold('Introduction'))
            .setDescription('Please read this short introduction to get started with your product.')
            .addFields(
                { name: bold('How do I get started?'), value: 'Below you will see an ' + inlineCode('Acknowledge') + ' button. After reading this, you’ll see a few steps to get the process going.' },
                { name: bold('What scripts do I have access to?'), value: 'All of our scripts are accessible through our Gamepack. Now that you’ve purchased your subscription, you’ll have access for the duration you selected.' },
                { name: bold('Why should I pay when people will just leak it?'), value: bold('People have tried and failed.') + ' Our script is secure and constantly updated to ensure it remains leak-proof. We want you to have access to a quality product that works as intended.' },
                { name: bold('Final Thoughts'), value: 'We’ve invested a lot of time and effort into the products you use to dominate the game. We strive to provide quality and stable code. You’ll have access to a lot of feedback, settings, and help through our community of players.' }
            )
            .setFooter({ text: 'Hit the button below to move to the next section.' });

        // Buttons for navigation and commands
        const firstRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('acknowledge')
                    .setLabel('Acknowledge')
                    .setStyle(ButtonStyle.Primary)
            );

        // Send the introduction embed as a static message
        await interaction.reply({ embeds: [introEmbed], components: [firstRow], ephemeral: false });
    },
};
