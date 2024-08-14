const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const glob = require('glob');
require('dotenv').config();

const commands = [];
const commandFiles = glob.sync(path.join(__dirname, 'commands/**/*.js'));

for (const file of commandFiles) {
    const command = require(file);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();
