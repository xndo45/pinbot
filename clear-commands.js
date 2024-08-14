require('dotenv').config();
const { REST, Routes } = require('discord.js');

async function clearGlobalCommands(clientId, token) {
    const rest = new REST({ version: '10' }).setToken(token);

    try {
        console.log('Started clearing global (/) commands.');

        const globalCommands = await rest.get(
            Routes.applicationCommands(clientId)
        );

        for (const command of globalCommands) {
            await rest.delete(
                Routes.applicationCommand(clientId, command.id)
            );
            console.log(`Deleted global command: ${command.name}`);
        }

        console.log('Successfully cleared global (/) commands.');
    } catch (error) {
        console.error('Error clearing global (/) commands:', error);
    }
}

clearGlobalCommands(process.env.CLIENT_ID, process.env.DISCORD_TOKEN);
 