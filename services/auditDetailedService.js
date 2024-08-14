const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { inlineCode } = require('@discordjs/formatters');
const { getExpiringPins } = require('../utils/mongoHelper');

/**
 * Creates an embed for a specific role with pagination for pins.
 * @param {string} role - The name of the role.
 * @param {Array} pins - The list of pins associated with the role.
 * @param {number} currentPage - The current page of pagination.
 * @param {number} totalPages - The total number of pages.
 * @returns {EmbedBuilder} - The embed containing role information and pins.
 */
function createRoleEmbed(role, pins, currentPage, totalPages) {
    const start = (currentPage - 1) * 20;
    const end = start + 20;
    const paginatedPins = pins.slice(start, end);

    const embed = new EmbedBuilder()
        .setTitle(`Role: ${inlineCode(role || 'N/A')}`)
        .setColor(0x00FF00)
        .setTimestamp()
        .setFooter({ text: `Page ${currentPage} of ${totalPages}` });

    if (!paginatedPins.length) {
        embed.setDescription('No expiring pins found for this role.');
    } else {
        const fields = paginatedPins.map(pin => ({
            name: `User: ${inlineCode(pin.userTag)}`,
            value: `${inlineCode('Pin')}: ${inlineCode(pin.pin)}\n${inlineCode('Expires')}: ${pin.expirationDate.toDateString()}`,
            inline: false,
        }));
        embed.addFields(fields);
    }

    return embed;
}

/**
 * Creates pagination buttons for navigating through role pages.
 * @param {string} role - The name of the role.
 * @param {number} currentPage - The current page of pagination.
 * @param {number} totalPages - The total number of pages.
 * @returns {ActionRowBuilder} - A row of buttons for pagination.
 */
function createRolePaginationButtons(role, currentPage, totalPages) {
    const prevButton = new ButtonBuilder()
        .setCustomId(`prevPage-${role}-${currentPage - 1}-${totalPages}`)
        .setLabel('Previous')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(currentPage === 1);

    const nextButton = new ButtonBuilder()
        .setCustomId(`nextPage-${role}-${currentPage + 1}-${totalPages}`)
        .setLabel('Next')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(currentPage === totalPages);

    return new ActionRowBuilder().addComponents(prevButton, nextButton);
}

/**
 * Handles interactions with role pagination buttons.
 * @param {Interaction} interaction - The interaction object from Discord.
 */
async function handleRoleButtonInteraction(interaction) {
    try {
        const [action, role, currentPageStr, totalPagesStr] = interaction.customId.split('-');
        let currentPage = parseInt(currentPageStr, 10);
        const totalPages = parseInt(totalPagesStr, 10);

        if (action === 'prevPage') {
            currentPage = Math.max(1, currentPage - 1);
        } else if (action === 'nextPage') {
            currentPage = Math.min(totalPages, currentPage + 1);
        }

        const expiringPins = await getExpiringPins();
        const pins = expiringPins.filter(pin => pin.roleName === (role === 'N/A' ? null : role));
        const roleEmbed = createRoleEmbed(role, pins, currentPage, totalPages);
        const buttons = createRolePaginationButtons(role, currentPage, totalPages);

        await interaction.update({ embeds: [roleEmbed], components: [buttons] });
    } catch (error) {
        console.error('Error handling role button interaction:', error);
        await interaction.followUp({ content: 'An error occurred while processing your request.', ephemeral: true });
    }
}

module.exports = {
    createRoleEmbed,
    createRolePaginationButtons,
    handleRoleButtonInteraction
};
