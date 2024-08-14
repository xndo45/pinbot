const Pin = require('../models/pinModel');
const {
    createErrorEmbed,
    createSuccessEmbed,
    createPaginatedSuccessEmbed,
    createPaginationButtons
} = require('../services/embedService');

function chunkArray(array, chunkSize) {
    const result = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        result.push(array.slice(i, i + chunkSize));
    }
    return result;
}

function formatPinDetails(pins) {
    return pins.map(pin => `**Pin:** ${pin.pin}\n**User:** ${pin.userTag}\n**Role:** ${pin.roleName}\n**Expires:** ${pin.expirationDate}`).join('\n\n');
}

async function searchPins(criteria, interaction, searchType, searchValue, page = 1) {
    try {
        // Validate page number
        if (page < 1) {
            await sendInvalidPage(interaction, page);
            return;
        }

        const totalPins = await Pin.countDocuments(criteria);
        if (totalPins === 0) {
            await sendNoResults(interaction, searchType, searchValue);
            return;
        }

        const pageSize = 10;
        const totalPages = Math.ceil(totalPins / pageSize);
        
        // Ensure page is within valid range
        if (page > totalPages) {
            await sendInvalidPage(interaction, page, totalPages);
            return;
        }

        const pins = await Pin.find(criteria)
            .skip((page - 1) * pageSize)
            .limit(pageSize);

        const pinDetails = formatPinDetails(pins);
        const successEmbed = createPaginatedSuccessEmbed('Search Results', pinDetails, [], interaction, page, totalPages);
        const paginationButtons = createPaginationButtons(page, totalPages);

        await interaction.editReply({ embeds: [successEmbed], components: [paginationButtons], ephemeral: true });
        await logSearchResults(interaction, searchType, searchValue, pinDetails);

    } catch (error) {
        await handleSearchError(interaction, error, searchType, searchValue);
    }
}

async function sendNoResults(interaction, searchType, searchValue) {
    const errorEmbed = createErrorEmbed('No Results', `No pins found for the provided ${searchType}: ${searchValue}`);
    await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
}

async function sendInvalidPage(interaction, page, totalPages = null) {
    let description = `Invalid page number: ${page}.`;
    if (totalPages) {
        description += ` Please enter a page number between 1 and ${totalPages}.`;
    } else {
        description += ` Page number must be greater than 0.`;
    }
    const errorEmbed = createErrorEmbed('Invalid Page', description);
    await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
}

async function handleSearchError(interaction, error, searchType, searchValue) {
    console.error(`Error searching pins by ${searchType}:`, error);

    const errorEmbed = createErrorEmbed('Error', `An error occurred while searching for the ${searchType}: ${error.message}`);
    await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });

    const logChannel = interaction.guild.channels.cache.find(channel => channel.name === 'pin-log');
    if (logChannel) {
        const logEmbed = createErrorEmbed(
            `Error Searching ${searchType}`,
            `An error occurred while searching for the ${searchType}:\n**${searchType}:** ${searchValue}\n**Error:** ${error.message}\n**Performed By:** ${interaction.user.tag}\n**Performed At:** ${new Date().toLocaleString()}`
        );
        await logChannel.send({ embeds: [logEmbed] });
    }
}

async function logSearchResults(interaction, searchType, searchValue, pinDetails) {
    const logChannel = interaction.guild.channels.cache.find(channel => channel.name === 'pin-log');
    if (logChannel) {
        const logEmbed = createSuccessEmbed(
            'Search Results',
            `**Performed By:** ${interaction.user.tag}\n**Performed At:** ${new Date().toLocaleString()}\n**Search Type:** ${searchType}\n**Search Value:** ${searchValue}\n**Results:**\n${pinDetails}`
        );
        await logChannel.send({ embeds: [logEmbed] });
    }
}

async function handleSearchPinByPin(pin, interaction, page = 1) {
    // Input validation for pin
    if (!pin || typeof pin !== 'string' || pin.trim().length === 0) {
        await sendInvalidInput(interaction, 'Pin');
        return;
    }

    const criteria = { pin: new RegExp(pin, 'i') };
    await searchPins(criteria, interaction, 'Pin', pin, page);
}

async function handleSearchPinByUsername(username, interaction, page = 1) {
    // Input validation for username
    if (!username || typeof username !== 'string' || username.trim().length === 0) {
        await sendInvalidInput(interaction, 'Username');
        return;
    }

    const criteria = { userTag: new RegExp(username, 'i') };
    await searchPins(criteria, interaction, 'Username', username, page);
}

async function handleSearchPinByRole(roleName, interaction, page = 1) {
    // Input validation for roleName
    if (!roleName || typeof roleName !== 'string' || roleName.trim().length === 0) {
        await sendInvalidInput(interaction, 'Role Name');
        return;
    }

    const criteria = { roleName: new RegExp(roleName, 'i') };
    await searchPins(criteria, interaction, 'Role', roleName, page);
}

async function sendInvalidInput(interaction, inputType) {
    const errorEmbed = createErrorEmbed('Invalid Input', `The provided ${inputType} is invalid. Please check your input and try again.`);
    await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
}

module.exports = {
    handleSearchPinByPin,
    handleSearchPinByUsername,
    handleSearchPinByRole
};
