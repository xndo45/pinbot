// services/loggingService.js
const { EmbedBuilder } = require('discord.js');
const { inlineCode } = require('@discordjs/formatters');

/**
 * Logs the result of a pin action to the specified log channel.
 * @param {Interaction} interaction - The interaction object from Discord.
 * @param {string} pin - The pin code involved in the action.
 * @param {string} userTag - The Discord tag of the user associated with the pin.
 * @param {string} roleName - The name of the role associated with the pin.
 * @param {Date} expirationDate - The expiration date of the pin.
 * @param {boolean} success - Whether the action was successful.
 * @param {string|null} errorMessage - The error message if the action failed.
 */
async function logPinAction(interaction, pin, userTag, roleName, expirationDate, success = true, errorMessage = null) {
    const logChannel = interaction.guild.channels.cache.find(channel => channel.name === 'pin-log');
    if (!logChannel) return;

    const embed = new EmbedBuilder()
        .setTitle(success ? 'Pin Action: Success' : 'Pin Action: Failed')
        .setColor(success ? 0x00FF00 : 0xFF0000)
        .setDescription(`A pin action has been ${success ? 'successfully' : 'unsuccessfully'} performed.`)
        .addFields(
            { name: 'Pin', value: inlineCode(pin), inline: true },
            { name: 'User', value: inlineCode(userTag), inline: true },
            { name: 'Role', value: inlineCode(roleName), inline: true },
            { name: 'Expires', value: expirationDate.toDateString(), inline: true },
            { name: 'Performed By', value: inlineCode(interaction.user.tag), inline: true },
            { name: 'Performed At', value: new Date().toLocaleString(), inline: true },
            { name: 'Result', value: success ? inlineCode('Success') : `Error: ${inlineCode(errorMessage)}` }
        )
        .setTimestamp();

    await logChannel.send({ embeds: [embed] });
}

module.exports = {
    logPinAction
};
