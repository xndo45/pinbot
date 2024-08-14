const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { findPinsByUserId } = require('../utils/mongoHelper');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('viewpins')
        .setDescription('View your pins'),
    async execute(interaction) {
        const userId = interaction.user.id;

        try {
            const userPins = await findPinsByUserId(userId);

            if (!userPins || userPins.length === 0) {
                const errorEmbed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle('No Pins Found')
                    .setDescription('You do not have any pins assigned.');

                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                return;
            }

            const pinsEmbed = createPinsEmbed(userPins);

            await interaction.reply({ embeds: [pinsEmbed], ephemeral: true });
        } catch (error) {
            const errorEmbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('Error')
                .setDescription('An error occurred while retrieving your pins.');

            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            console.error('Error retrieving pins for user:', error);
        }
    },
};

// Helper function to create the pins embed
function createPinsEmbed(userPins) {
    const pinsEmbed = new EmbedBuilder()
        .setTitle('Your Pins')
        .setColor(0x00AE86);

    userPins.forEach(pin => {
        pinsEmbed.addFields(
            { name: 'Pin Code', value: pin.pin, inline: true },
            { name: 'Role', value: pin.roleName, inline: true },
            { name: 'Expiration Date', value: pin.expirationDate ? pin.expirationDate.toDateString() : 'No expiration', inline: true }
        );
    });

    return pinsEmbed;
}
