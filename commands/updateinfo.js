const { SlashCommandBuilder } = require('@discordjs/builders');
const { handleRoleUpdate, validateAndFetchRoles } = require('../handlers/roleHandler');
const { createSuccessEmbed, createActionRow } = require('../services/embedservice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('updateinfo')
        .setDescription('Check and update pin information in the database'),
    async execute(interaction) {
        try {
            const guild = interaction.guild;

            if (!guild) {
                await interaction.reply({ content: 'This command must be run in a server.', ephemeral: true });
                return;
            }

            console.log(`Command executed in guild: ${guild.name} (ID: ${guild.id}) by user: ${interaction.user.tag}`);

            const roleValidationResults = await validateAndFetchRoles(guild);

            const embed = createSuccessEmbed('Role Validation Results', 'Here are the results of the role validation:', roleValidationResults);
            await interaction.reply({ embeds: [embed], ephemeral: true });

            // Show action buttons to proceed with updates
            const actionRow = createActionRow(); // Create a row with buttons for the user to choose actions
            const followUpMessage = await interaction.followUp({ content: 'Choose an action:', components: [actionRow], ephemeral: true });

            // Collect and handle button interactions
            const filter = (i) => i.user.id === interaction.user.id;
            const collector = followUpMessage.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async (i) => {
                try {
                    await handleRoleUpdate(i); // Delegate the button action to the role handler
                    await i.update({ content: 'Action processed successfully!', components: [] });
                } catch (error) {
                    console.error('Error handling role update:', error);
                    await i.update({ content: `An error occurred while processing your action: ${error.message}`, components: [] });
                }
            });

            collector.on('end', async (collected, reason) => {
                if (reason === 'time') {
                    await interaction.followUp({ content: 'Time expired. Please run the command again if you need to update records.', components: [], ephemeral: true });
                }
            });

        } catch (error) {
            console.error('Error during command execution:', error);
            await interaction.reply({ content: `An error occurred: ${error.message}`, ephemeral: true });
        }
    }
};
