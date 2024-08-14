const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const ServerConfig = require('../models/serverModel');
const { createErrorEmbed, createSuccessEmbed } = require('../services/embedService');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverconfig')
        .setDescription('Configure the server settings')
        .addSubcommand(subcommand =>
            subcommand
                .setName('setup')
                .setDescription('Setup the server configuration'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('update')
                .setDescription('Update the server configuration')
                .addStringOption(option =>
                    option.setName('special1m')
                        .setDescription('Special 1m role name')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('special3m')
                        .setDescription('Special 3m role name')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('special1y')
                        .setDescription('Special 1y role name')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('speciallifetime')
                        .setDescription('Special Lifetime role name')
                        .setRequired(false))),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const errorEmbed = createErrorEmbed('Permission Denied', 'You do not have the required role to use this command.', [], interaction);
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }

        const subcommand = interaction.options.getSubcommand();
        if (subcommand === 'setup') {
            await setupServerConfig(interaction);
        } else if (subcommand === 'update') {
            await updateServerConfig(interaction);
        }
    }
};

async function setupServerConfig(interaction) {
    try {
        const guild = interaction.guild;

        // Fetch roles
        const special1mRole = guild.roles.cache.find(r => r.name === 'Special 1m');
        const special3mRole = guild.roles.cache.find(r => r.name === 'Special 3m');
        const special1yRole = guild.roles.cache.find(r => r.name === 'Special 1y');
        const specialLifetimeRole = guild.roles.cache.find(r => r.name === 'Special Lifetime');
        const activationRole = guild.roles.cache.find(r => r.name === 'Activation');
        const activatedRole = guild.roles.cache.find(r => r.name === 'Activated');

        if (!special1mRole || !special3mRole || !special1yRole || !specialLifetimeRole) {
            const errorEmbed = createErrorEmbed('Role Missing', 'One or more special roles are missing.', [], interaction);
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });

            const logChannel = interaction.guild.channels.cache.find(channel => channel.name === 'pin-log');
            if (logChannel) {
                const logEmbed = createErrorEmbed('Setup Server Config Error', 'One or more special roles are missing.', [], interaction);
                await logChannel.send({ embeds: [logEmbed] });
            }

            return;
        }

        // Check if the server config already exists
        let serverConfig = await ServerConfig.findOne({ serverId: guild.id });

        if (serverConfig) {
            // Update the existing server configuration
            serverConfig.special1mRoleId = special1mRole.id;
            serverConfig.special1mRoleName = special1mRole.name;
            serverConfig.special3mRoleId = special3mRole.id;
            serverConfig.special3mRoleName = special3mRole.name;
            serverConfig.special1yRoleId = special1yRole.id;
            serverConfig.special1yRoleName = special1yRole.name;
            serverConfig.specialLifetimeRoleId = specialLifetimeRole.id;
            serverConfig.specialLifetimeRoleName = specialLifetimeRole.name;

            await serverConfig.save();
        } else {
            // Create a new server configuration
            serverConfig = new ServerConfig({
                serverId: guild.id,
                serverName: guild.name,
                special1mRoleId: special1mRole.id,
                special1mRoleName: special1mRole.name,
                special3mRoleId: special3mRole.id,
                special3mRoleName: special3mRole.name,
                special1yRoleId: special1yRole.id,
                special1yRoleName: special1yRole.name,
                specialLifetimeRoleId: specialLifetimeRole.id,
                specialLifetimeRoleName: specialLifetimeRole.name
            });

            await serverConfig.save();
        }

        const successEmbed = createSuccessEmbed('Server Configured', `Server configuration completed successfully for ${guild.name}.`, [], interaction);
        await interaction.reply({ embeds: [successEmbed], ephemeral: true });

        const logChannel = interaction.guild.channels.cache.find(channel => channel.name === 'pin-log');
        if (logChannel) {
            const logEmbed = createSuccessEmbed('Server Configured', `**Server:** ${guild.name}\n**Configured By:** ${interaction.user.tag}\n**Configured At:** ${new Date().toLocaleString()}\n**Roles Configured:**\n- Special 1m: ${special1mRole.name}\n- Special 3m: ${special3mRole.name}\n- Special 1y: ${special1yRole.name}\n- Special Lifetime: ${specialLifetimeRole.name}`, [], interaction);
            await logChannel.send({ embeds: [logEmbed] });
        }
    } catch (error) {
        console.error('Error setting up server config:', error);
        const errorEmbed = createErrorEmbed('Error', `An error occurred while setting up the server configuration: ${error.message}`, [], interaction);
        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });

        const logChannel = interaction.guild.channels.cache.find(channel => channel.name === 'pin-log');
        if (logChannel) {
            const logEmbed = createErrorEmbed('Error Setting Up Server Config', `An error occurred while setting up the server configuration:\n**Error:** ${error.message}\n**Performed By:** ${interaction.user.tag}\n**Performed At:** ${new Date().toLocaleString()}`, [], interaction);
            await logChannel.send({ embeds: [logEmbed] });
        }
    }
}

async function updateServerConfig(interaction) {
    try {
        const guild = interaction.guild;

        // Fetch roles based on provided names
        const special1mRoleName = interaction.options.getString('special1m');
        const special3mRoleName = interaction.options.getString('special3m');
        const special1yRoleName = interaction.options.getString('special1y');
        const specialLifetimeRoleName = interaction.options.getString('speciallifetime');

        const special1mRole = special1mRoleName ? guild.roles.cache.find(r => r.name === special1mRoleName) : null;
        const special3mRole = special3mRoleName ? guild.roles.cache.find(r => r.name === special3mRoleName) : null;
        const special1yRole = special1yRoleName ? guild.roles.cache.find(r => r.name === special1yRoleName) : null;
        const specialLifetimeRole = specialLifetimeRoleName ? guild.roles.cache.find(r => r.name === specialLifetimeRoleName) : null;

        // Check if the server config exists
        let serverConfig = await ServerConfig.findOne({ serverId: guild.id });

        if (!serverConfig) {
            const errorEmbed = createErrorEmbed('Configuration Missing', 'No existing server configuration found to update.', [], interaction);
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });

            const logChannel = interaction.guild.channels.cache.find(channel => channel.name === 'pin-log');
            if (logChannel) {
                const logEmbed = createErrorEmbed('Update Server Config Error', 'No existing server configuration found to update.', [], interaction);
                await logChannel.send({ embeds: [logEmbed] });
            }

            return;
        }

        // Update the existing server configuration
        if (special1mRole) {
            serverConfig.special1mRoleId = special1mRole.id;
            serverConfig.special1mRoleName = special1mRole.name;
        }
        if (special3mRole) {
            serverConfig.special3mRoleId = special3mRole.id;
            serverConfig.special3mRoleName = special3mRole.name;
        }
        if (special1yRole) {
            serverConfig.special1yRoleId = special1yRole.id;
            serverConfig.special1yRoleName = special1yRole.name;
        }
        if (specialLifetimeRole) {
            serverConfig.specialLifetimeRoleId = specialLifetimeRole.id;
            serverConfig.specialLifetimeRoleName = specialLifetimeRole.name;
        }

        await serverConfig.save();

        const successEmbed = createSuccessEmbed('Server Config Updated', `Server configuration updated successfully for ${guild.name}.`, [], interaction);
        await interaction.reply({ embeds: [successEmbed], ephemeral: true });

        const logChannel = interaction.guild.channels.cache.find(channel => channel.name === 'pin-log');
        if (logChannel) {
            const logEmbed = createSuccessEmbed('Server Config Updated', `**Server:** ${guild.name}\n**Updated By:** ${interaction.user.tag}\n**Updated At:** ${new Date().toLocaleString()}\n**Roles Updated:**\n${special1mRole ? `- Special 1m: ${special1mRole.name}\n` : ''}${special3mRole ? `- Special 3m: ${special3mRole.name}\n` : ''}${special1yRole ? `- Special 1y: ${special1yRole.name}\n` : ''}${specialLifetimeRole ? `- Special Lifetime: ${specialLifetimeRole.name}\n` : ''}`, [], interaction);
            await logChannel.send({ embeds: [logEmbed] });
        }
    } catch (error) {
        console.error('Error updating server config:', error);
        const errorEmbed = createErrorEmbed('Error', `An error occurred while updating the server configuration: ${error.message}`, [], interaction);
        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });

        const logChannel = interaction.guild.channels.cache.find(channel => channel.name === 'pin-log');
        if (logChannel) {
            const logEmbed = createErrorEmbed('Error Updating Server Config', `An error occurred while updating the server configuration:\n**Error:** ${error.message}\n**Performed By:** ${interaction.user.tag}\n**Performed At:** ${new Date().toLocaleString()}`, [], interaction);
            await logChannel.send({ embeds: [logEmbed] });
        }
    }
}
