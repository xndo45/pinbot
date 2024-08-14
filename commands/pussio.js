const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { bold, italic, inlineCode, underline, strikethrough } = require('@discordjs/formatters');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pussio')
        .setDescription('Spams "PUSSIO" over 8 lines with different styles'),
    async execute(interaction) {
        const messages = [
            bold('PUSSIO'),    // Bold
            italic('PUSSIO'),   // Italic
            inlineCode('PUSSIO'),   // Inline Code
            underline('PUSSIO'), // Underline
            strikethrough('PUSSIO'), // Strikethrough
            bold(italic('PUSSIO')), // Bold + Italic
            bold(strikethrough('PUSSIO')), // Bold + Strikethrough
            bold(italic(underline('PUSSIO'))), // Bold + Italic + Underline
        ];

        // Add some emojis to spice it up
        const emojis = ['🔥', '💥', '⚡', '💣', '🎉', '🚀', '💪', '👊'];

        // Randomize colors for the embed
        const colors = [0xFF5733, 0x33FF57, 0x3357FF, 0xFF33A1, 0x33FFD5, 0xFF9133, 0x9133FF, 0x33FFB3];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        // ASCII art
        const asciiArt = `
        █▀█ █░█ █▀ █▀ █ █▀█
        █▀▀ █▄█ ▄█ ▄█ █ █▄█
        `;

        // Combine the messages with new lines and emojis
        const messageContent = messages.map(msg => `${emojis[Math.floor(Math.random() * emojis.length)]} ${msg} ${emojis[Math.floor(Math.random() * emojis.length)]}`).join('\n');

        // Create an embed with the flashy content
        const embed = new EmbedBuilder()
            .setColor(randomColor)
            .setTitle(bold('PUSSIO ATTACK!'))  // Corrected title without extra bolding
            .setDescription(`${asciiArt}\n${messageContent}`)
            .setFooter({ text: 'Pussio power unleashed!' })
            .setTimestamp();

        // Reply to the interaction with the formatted embed message
        await interaction.reply({
            embeds: [embed],
            ephemeral: false, // Set to true if you want only the user to see it
        });
    },
};
