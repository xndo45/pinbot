const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { inlineCode, bold, italic } = require('@discordjs/formatters');

// Utility function to create buttons
function createButton(customId, label, style = ButtonStyle.Primary, disabled = false) {
    return new ButtonBuilder()
        .setCustomId(customId)
        .setLabel(label)
        .setStyle(style)
        .setDisabled(disabled);
}

// Utility function to create an embed with common properties and formatting options
function createEmbed({ title, description, color, fields = [], footerText, timestamp = true }) {
    const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color);

    // Ensure fields are valid and contain both name and value
    if (fields.length > 0) {
        fields.forEach(field => {
            if (field.name && field.value) {
                embed.addFields({ name: field.name, value: field.value });
            } else {
                console.error('Embed field is missing name or value:', field);
            }
        });
    }

    if (timestamp) embed.setTimestamp();
    if (footerText) embed.setFooter({ text: footerText });

    return embed;
}

// Embed for error messages
function createErrorEmbed(title, description, fields = []) {
    return createEmbed({
        title: bold(title),  // Bold title text
        description: italic(description),  // Italic description text
        color: 0xFF0000,  // Red color for errors
        fields
    });
}

// Embed for success messages
function createSuccessEmbed(title, description, fields = []) {
    return createEmbed({
        title: bold(title),  // Bold title text
        description: italic(description),  // Italic description text
        color: 0x00FF00,  // Green color for success
        fields
    });
}

// Embed for paginated success messages
function createPaginatedSuccessEmbed(title, description, fields = [], currentPage = 1, totalPages = 1) {
    return createEmbed({
        title: bold(title),  // Bold title text
        description: italic(description),  // Italic description text
        color: 0x00FF00,  // Green color for success
        fields,
        footerText: `Page ${currentPage} of ${totalPages}`
    });
}

// Embed for users without pins
function createUsersWithoutPinsEmbed(usersWithoutPins, roleName, currentPage = 1, totalPages = 1) {
    const CHUNK_SIZE = 25;
    const start = (currentPage - 1) * CHUNK_SIZE;
    const end = start + CHUNK_SIZE;
    const chunk = usersWithoutPins.slice(start, end);

    const fields = chunk.map(user => ({
        name: inlineCode(`${user.username} (${user.userId})`),
        value: `Role: ${inlineCode(roleName)}`,
    }));

    return createEmbed({
        title: bold(`Users in the ${roleName} Role with No Pin Information`),  // Bold title text
        description: italic('The following users are in the role but have no corresponding pin records in the database:'),  // Italic description text
        color: 0xFF0000,  // Red color for errors
        fields,
        footerText: `Page ${currentPage} of ${totalPages}`
    });
}

// Pagination buttons for embed navigation
function createPaginationButtons(currentPage, totalPages) {
    const prevButton = createButton(`prevPage-${currentPage - 1}`, 'Previous', ButtonStyle.Primary, currentPage === 1);
    const nextButton = createButton(`nextPage-${currentPage + 1}`, 'Next', ButtonStyle.Primary, currentPage === totalPages);

    return new ActionRowBuilder().addComponents(prevButton, nextButton);
}

// Action row with role update buttons
function createActionRow() {
    const buttons = [
        createButton('update-all', 'Update All Records'),
        createButton('update-special1m', 'Update Special 1m Records'),
        createButton('update-special3m', 'Update Special 3m Records'),
        createButton('update-special1y', 'Update Special 1y Records'),
        createButton('update-special-lifetime', 'Update Special Lifetime Records')
    ];

    return new ActionRowBuilder().addComponents(buttons);
}

// Embed to notify the user about their added pin details
function createPinAddedEmbed(pin, roleName, expirationDate, userTag) {
    const expirationTime = expirationDate === new Date('2099-12-31')
        ? 'Lifetime access'
        : `${Math.ceil((expirationDate - new Date()) / (1000 * 60 * 60 * 24))} days remaining`;

    return createEmbed({
        title: bold('Pin Added Successfully!'),  // Bold title text
        description: `Your pin code has been added.`,
        color: 0x00FF00,  // Green color for success
        fields: [
            { name: 'Pin Code', value: inlineCode(pin), inline: true },
            { name: 'Role', value: inlineCode(roleName), inline: true },
            { name: 'Expiration', value: inlineCode(expirationTime), inline: true }
        ],
        footerText: `Added for user: ${userTag}`
    });
}

module.exports = {
    createErrorEmbed,
    createSuccessEmbed,
    createPaginatedSuccessEmbed,
    createUsersWithoutPinsEmbed,
    createPaginationButtons,
    createActionRow,
    createPinAddedEmbed
};
