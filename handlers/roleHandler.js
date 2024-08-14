const { getServerConfig } = require('../utils/mongoHelper');
const { createUsersWithoutPinsEmbed, createPaginationButtons } = require('../services/embedservice');
const { processRoleRecords } = require('../utils/roleUtils');

async function validateAndFetchRoles(guild) {
    try {
        const serverConfig = await getServerConfig(guild.id);
        const roleIds = [
            { id: serverConfig.special1mRoleId, name: serverConfig.special1mRoleName },
            { id: serverConfig.special3mRoleId, name: serverConfig.special3mRoleName },
            { id: serverConfig.special1yRoleId, name: serverConfig.special1yRoleName },
            { id: serverConfig.specialLifetimeRoleId, name: serverConfig.specialLifetimeRoleName },
        ];

        await guild.members.fetch();

        let roleValidationResults = [];
        for (const role of roleIds) {
            const roleObject = guild.roles.cache.get(role.id);
            if (!roleObject) {
                roleValidationResults.push({
                    name: `Role not found`,
                    value: `${role.name} (ID: ${role.id})`
                });
            } else {
                roleValidationResults.push({
                    name: `Role found`,
                    value: `${role.name} (ID: ${role.id}) with ${roleObject.members.size} members.`
                });
            }
        }

        return roleValidationResults;
    } catch (error) {
        console.error('Error validating and fetching roles:', error);
        throw new Error('Failed to validate and fetch roles.');
    }
}

async function handleRoleUpdate(interaction) {
    try {
        await interaction.deferReply({ ephemeral: true });  // Defer the interaction reply

        const [action, roleKey, pageStr] = interaction.customId.split('-');
        let currentPage = parseInt(pageStr, 10) || 1;

        const serverConfig = await getServerConfig(interaction.guild.id);
        const roleMap = {
            special1m: serverConfig.special1mRoleId,
            special3m: serverConfig.special3mRoleId,
            special1y: serverConfig.special1yRoleId,
            specialLifetime: serverConfig.specialLifetimeRoleId,
        };

        const roleId = roleMap[roleKey];
        if (!roleId) {
            return interaction.followUp({ content: `Role ID for ${roleKey} not found in server configuration.`, ephemeral: true });
        }

        const results = await processRoleRecords(interaction, roleId, roleKey);

        const totalPages = Math.ceil(results.usersWithoutPins.length / 25);
        currentPage = Math.max(1, Math.min(currentPage, totalPages));

        const embed = createUsersWithoutPinsEmbed(results.usersWithoutPins, roleKey, currentPage, totalPages);
        const actionRow = createPaginationButtons(currentPage, totalPages);

        await interaction.editReply({ embeds: [embed], components: [actionRow] });
    } catch (error) {
        console.error('Error handling role update:', error);
        await interaction.followUp({ content: `An error occurred while updating the role: ${error.message}`, ephemeral: true });
    }
}

module.exports = { validateAndFetchRoles, handleRoleUpdate };
