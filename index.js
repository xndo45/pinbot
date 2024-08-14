require('dotenv').config();
const mongoose = require('mongoose');
const { Client, GatewayIntentBits, Partials, EmbedBuilder } = require('discord.js');  // Correctly import EmbedBuilder
const cron = require('node-cron');

// Import utility functions and command handlers
const { registerCommands } = require('./registerCommands');
const { getExpiringPins } = require('./utils/mongoHelper');
const { createAuditSummaryEmbed, createRoleButtons } = require('./services/auditEmbedService');
const { createRoleEmbed, createRolePaginationButtons, handleRoleButtonInteraction } = require('./services/auditDetailedService');
const {
    handleAddPinCommand,
    handleUpdateInfoCommand,
    handleUpdateExpiryCommand,
    handleCheckSubscriptionCommand,
    handleDeletePinCommand,
    handleSearchPinCommand,
    handleViewPinsCommand,
    handleAuditReportCommand,
    handleDashboardCommand,
    handlePussioCommand,
} = require('./commands/index');  // Importing all commands from an index file in the commands folder

const { handleInteraction } = require('./helpers/dashboardHelper');

// Initialize the Discord client with all required intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
    partials: [
        Partials.Channel,
    ],
});

// Function to connect to MongoDB
async function connectToDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('MongoDB connected');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1); // Exit if the database connection fails
    }
}

// Function for graceful shutdown
function setupGracefulShutdown() {
    process.on('SIGINT', async () => {
        console.log('Shutting down...');
        await mongoose.disconnect();
        client.destroy();
        process.exit(0);
    });
}

// Function to handle when the bot is ready
async function onBotReady() {
    console.log('Bot is ready');
    client.user.setPresence({ activities: [{ name: 'Managing Pins!' }] });

    try {
        const guildIds = process.env.GUILD_IDS ? process.env.GUILD_IDS.split(',') : [];
        await registerCommands(client.user.id, guildIds, process.env.DISCORD_TOKEN);
        console.log('Commands registered successfully');
    } catch (error) {
        console.error('Error registering commands:', error);
    }

    scheduleCronJobs();
}

// Schedule recurring tasks using cron
function scheduleCronJobs() {
    cron.schedule('0 0 * * *', async () => {
        console.log('Executing daily scheduled tasks');
        // Add daily task logic here
    });

    cron.schedule('0 * * * *', async () => {
        await sendAutomatedAuditReport();
    });
}

// Handle command interactions
async function handleCommandInteraction(interaction) {
    const { commandName } = interaction;

    try {
        switch (commandName) {
            case 'addpin':
                await handleAddPinCommand(interaction);
                break;
            case 'updateinfo':
                await handleUpdateInfoCommand(interaction);
                break;
            case 'updateexpiry':
                await handleUpdateExpiryCommand(interaction);
                break;
            case 'checksubscription':
                await handleCheckSubscriptionCommand(interaction);
                break;
            case 'deletepin':
                await handleDeletePinCommand(interaction);
                break;
            case 'searchpin':
                await handleSearchPinCommand(interaction);
                break;
            case 'viewpins':
                await handleViewPinsCommand(interaction);
                break;
            case 'auditreport':
                await handleAuditReportCommand(interaction);
                break;
            case 'serverconfig':
                await handleServerConfigCommand(interaction);
                break;
            case 'dashboard':
                await handleDashboardCommand(interaction);
                break;
            case 'pussio':
                await handlePussioCommand(interaction);
                break;
            default:
                await interaction.reply({ content: 'Unknown command!', ephemeral: true });
                break;
        }
    } catch (error) {
        console.error(`Error executing command ${commandName}:`, error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: `An error occurred while executing the command: ${error.message}`, ephemeral: true });
        }
    }
}

// Handle button interactions
async function handleButtonInteraction(interaction) {
    const { customId } = interaction;

    try {
        if (['viewRole', 'prevPage', 'nextPage'].includes(customId.split('-')[0])) {
            await handleRoleButtonInteraction(interaction);
        } else if (['download_zen', 'download_cpp', 'add_pin'].includes(customId)) {
            const activationRole = process.env.ACTIVATION_ROLE_ID || 'ACTIVATION_ROLE_ID';
            const activatedRole = process.env.ACTIVATED_ROLE_ID || 'ACTIVATED_ROLE_ID';
            await handleInteraction(interaction, activationRole, activatedRole);
        } else if (['acknowledge', 'view_files', 'view_activation'].includes(customId)) {
            // Embed and interaction handling specific to your dashboard
            if (customId === 'acknowledge') {
                await interaction.update({ embeds: [filesEmbed], components: [], ephemeral: true });
            } else if (customId === 'view_files') {
                await interaction.update({ embeds: [filesEmbed], components: [], ephemeral: true });
            } else if (customId === 'view_activation') {
                await interaction.update({ embeds: [pinActivationEmbed], components: [], ephemeral: true });
            }
        } else {
            console.warn(`Unhandled button action: ${customId}`);
            await interaction.reply({ content: `Unhandled button action: ${customId}`, ephemeral: true });
        }
    } catch (error) {
        console.error(`Error handling button interaction for action ${customId}:`, error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: `An error occurred while processing the button interaction: ${error.message}`, ephemeral: true });
        }
    }
}

// Function to start the bot
async function startBot() {
    await connectToDatabase();
    setupGracefulShutdown();
    client.once('ready', onBotReady);
    client.on('interactionCreate', async interaction => {
        try {
            if (interaction.isCommand()) {
                await handleCommandInteraction(interaction);
            } else if (interaction.isButton()) {
                await handleButtonInteraction(interaction);
            }
        } catch (error) {
            console.error('Error handling interaction:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: 'An error occurred while processing your request.', ephemeral: true });
            }
        }
    });

    // Log the bot into Discord
    try {
        await client.login(process.env.DISCORD_TOKEN);
        console.log('Bot logged in successfully');
    } catch (err) {
        console.error('Failed to log in:', err);
        process.exit(1);
    }
}

// Start the bot
startBot();
