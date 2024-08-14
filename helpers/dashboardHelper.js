const { EmbedBuilder } = require('discord.js');

/**
 * Sends the Zen++ download link to the user.
 * @param {Object} interaction - The interaction object from the button press.
 */
async function handleZenDownload(interaction) {
    await interaction.update({
        content: 'Please download Zen++ here: [Zen++ Download Link](https://example.com)',
        components: []
    });
}

/**
 * Sends the C++ Runtimes download link to the user.
 * @param {Object} interaction - The interaction object from the button press.
 */
async function handleCppDownload(interaction) {
    await interaction.update({
        content: 'Please download C++ Runtimes here: [C++ Runtimes Download Link](https://example.com)',
        components: []
    });
}

/**
 * Handles the add pin interaction and updates the user's roles.
 * @param {Object} interaction - The interaction object from the button press.
 * @param {String} activationRole - The ID of the Activation role.
 * @param {String} activatedRole - The ID of the Activated role.
 */
async function handleAddPin(interaction, activationRole, activatedRole) {
    // Add your logic to validate pin here
    // Simulate the pin being added
    await interaction.member.roles.remove(activationRole);
    await interaction.member.roles.add(activatedRole);

    await interaction.update({
        content: 'Use `/addpin` to add your pin. Once completed, you will be activated.',
        components: []
    });

    await interaction.followUp({
        content: 'Congratulations! You have been activated.',
        ephemeral: true
    });
}

/**
 * Handles the interaction based on the customId of the button.
 * @param {Object} interaction - The interaction object from the button press.
 * @param {String} activationRole - The ID of the Activation role.
 * @param {String} activatedRole - The ID of the Activated role.
 */
async function handleInteraction(interaction, activationRole, activatedRole) {
    switch (interaction.customId) {
        case 'download_zen':
            await handleZenDownload(interaction);
            break;
        case 'download_cpp':
            await handleCppDownload(interaction);
            break;
        case 'add_pin':
            await handleAddPin(interaction, activationRole, activatedRole);
            break;
        default:
            await interaction.reply({ content: 'Unknown interaction!', ephemeral: true });
    }
}

module.exports = {
    handleInteraction,
    handleZenDownload,
    handleCppDownload,
    handleAddPin
};
