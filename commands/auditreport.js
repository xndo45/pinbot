const { createAuditSummaryEmbed } = require('../services/auditEmbedService');
const { findMembersWithoutPins } = require('../utils/roleUtils');
const { getServerConfig } = require('../utils/mongoHelper');
const { createUsersWithoutPinsEmbed } = require('../services/embedService');

/**
 * Sends an audit report detailing members without pins for specific roles.
 * @param {Interaction} interaction - The interaction object from Discord.
 */
async function sendAuditReport(interaction) {
    try {
        await interaction.deferReply({ ephemeral: true });

        const serverConfig = await getServerConfig(interaction.guild.id);
        const roleIds = [
            { id: serverConfig.special1mRoleId, name: serverConfig.special1mRoleName },
            { id: serverConfig.special3mRoleId, name: serverConfig.special3mRoleName },
            { id: serverConfig.special1yRoleId, name: serverConfig.special1yRoleName },
            { id: serverConfig.specialLifetimeRoleId, name: serverConfig.specialLifetimeRoleName },
        ];

        let rolesSummary = '';
        let embedsToSend = [];

        for (const { id: roleId, name: roleName } of roleIds) {
            const role = interaction.guild.roles.cache.get(roleId);
            if (role) {
                const membersWithoutPins = await findMembersWithoutPins(interaction.guild, role);
                rolesSummary += `${roleName}: ${membersWithoutPins.length} members without pins.\n`;

                if (membersWithoutPins.length > 0) {
                    const embed = createUsersWithoutPinsEmbed(membersWithoutPins, roleName);
                    embedsToSend.push(embed);
                }
            } else {
                rolesSummary += `${roleName}: Role not found.\n`;
            }
        }

        if (!rolesSummary.trim()) {
            rolesSummary = 'No roles with members found or no members without pins.';
        }

        const summaryEmbed = createAuditSummaryEmbed(roleIds.length, rolesSummary);
        embedsToSend.unshift(summaryEmbed); // Add summary to the beginning of the array

        // Send embeds in batches if there are more than 10
        if (embedsToSend.length > 10) {
            for (let i = 0; i < embedsToSend.length; i += 10) {
                const embedBatch = embedsToSend.slice(i, i + 10);
                if (i === 0) {
                    await interaction.editReply({ embeds: embedBatch });
                } else {
                    await interaction.followUp({ embeds: embedBatch, ephemeral: true });
                }
            }
        } else {
            await interaction.editReply({ embeds: embedsToSend });
        }
    } catch (error) {
        console.error('Error during audit report generation:', error);
        await interaction.editReply({ content: 'An error occurred while generating the audit report.', ephemeral: true });
    }
}

module.exports = { 
    execute: sendAuditReport, // Exported as 'execute' to align with other commands
    handleRoleButtonInteraction: async function(interaction) {
        // Your logic for handling role button interaction
    }
};
