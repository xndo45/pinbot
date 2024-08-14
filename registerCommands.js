require('dotenv').config();
const { REST, Routes, ApplicationCommandOptionType } = require('discord.js');

// Define your commands
const commands = [
    {
        name: 'pussio',
        description: 'Spams pussio over 8 lines with different colors and sizes',
    },
    {
        name: 'serverconfig',
        description: 'Configure the server settings',
        options: [
            {
                type: ApplicationCommandOptionType.Subcommand,
                name: 'setup',
                description: 'Setup the server configuration',
            },
            {
                type: ApplicationCommandOptionType.Subcommand,
                name: 'update',
                description: 'Update the server configuration',
                options: [
                    {
                        type: ApplicationCommandOptionType.String,
                        name: 'special1m',
                        description: 'Special 1m role name',
                        required: false,
                    },
                    {
                        type: ApplicationCommandOptionType.String,
                        name: 'special3m',
                        description: 'Special 3m role name',
                        required: false,
                    },
                    {
                        type: ApplicationCommandOptionType.String,
                        name: 'special1y',
                        description: 'Special 1y role name',
                        required: false,
                    },
                    {
                        type: ApplicationCommandOptionType.String,
                        name: 'speciallifetime',
                        description: 'Special Lifetime role name',
                        required: false,
                    },
                ],
            },
        ],
    },
    {
        name: 'dashboard',
        description: 'Displays the activation dashboard',
    },
    {
        name: 'addpin',
        description: 'Add a pin code',
        options: [
            {
                type: ApplicationCommandOptionType.Subcommand,
                name: 'admin',
                description: 'Admin: Add a new pin with user and role details',
                options: [
                    {
                        type: ApplicationCommandOptionType.String,
                        name: 'pin',
                        description: 'The pin code',
                        required: true,
                    },
                    {
                        type: ApplicationCommandOptionType.String,
                        name: 'usertag',
                        description: 'The user tag',
                        required: true,
                    },
                    {
                        type: ApplicationCommandOptionType.String,
                        name: 'rolename',
                        description: 'The role name',
                        required: true,
                    },
                ],
            },
            {
                type: ApplicationCommandOptionType.Subcommand,
                name: 'user',
                description: 'User: Add a new pin',
                options: [
                    {
                        type: ApplicationCommandOptionType.String,
                        name: 'pin',
                        description: 'The pin code',
                        required: true,
                    },
                ],
            },
        ],
    },
    {
        name: 'updateinfo',
        description: 'Update your own pin information',
        options: [], // No options required for this command
    },
    {
        name: 'checksubscription',
        description: 'Check the subscription status of a user',
        options: [
            {
                type: ApplicationCommandOptionType.String,
                name: 'username',
                description: 'The username to check',
                required: true,
            },
        ],
    },
    {
        name: 'deletepin',
        description: 'Delete pin codes',
        options: [
            {
                type: ApplicationCommandOptionType.String,
                name: 'pin',
                description: 'The pin code to delete',
                required: false,
            },
            {
                type: ApplicationCommandOptionType.String,
                name: 'usertag',
                description: 'The user tag whose pins to delete',
                required: false,
            },
        ],
    },
    {
        name: 'searchpin',
        description: 'Search for a pin by pin code, username, or role name',
        options: [
            {
                type: ApplicationCommandOptionType.String,
                name: 'pin',
                description: 'The pin code to search for',
                required: false,
            },
            {
                type: ApplicationCommandOptionType.String,
                name: 'username',
                description: 'The username whose pins to search for',
                required: false,
            },
            {
                type: ApplicationCommandOptionType.String,
                name: 'rolename',
                description: 'The role name to search for',
                required: false,
            },
        ],
    },
    {
        name: 'updateexpiry',
        description: 'Update the expiry date of a pin',
        options: [
            {
                type: ApplicationCommandOptionType.String,
                name: 'date',
                description: 'The new expiration date (YYYY-MM-DD)',
                required: true,
            },
            {
                type: ApplicationCommandOptionType.String,
                name: 'pin',
                description: 'The pin code',
                required: false,
            },
            {
                type: ApplicationCommandOptionType.String,
                name: 'usertag',
                description: 'The user tag associated with the pin',
                required: false,
            },
        ],
    },
    {
        name: 'viewpins',
        description: 'View your pins',
        options: [], // No options required for this command
    },
    {
        name: 'auditreport',
        description: 'Generate an audit report on pin expirations. (Admin only)',
        options: [], // No options required for this command
    },
];

// Function to register commands to specific guilds
async function registerCommands(clientId, guildIds, token) {
    const rest = new REST({ version: '10' }).setToken(token);

    try {
        console.log('Started refreshing guild (/) commands.');

        for (const guildId of guildIds) {
            try {
                await rest.put(
                    Routes.applicationGuildCommands(clientId, guildId),
                    { body: commands },
                );
                console.log(`Successfully reloaded guild (/) commands for guild ID ${guildId}.`);
            } catch (error) {
                console.error(`Error reloading guild (/) commands for guild ID ${guildId}:`, error);
            }
        }

        console.log('Successfully refreshed all guild commands.');

    } catch (error) {
        console.error('Error reloading guild (/) commands:', error);
    }
}

module.exports = { registerCommands };
