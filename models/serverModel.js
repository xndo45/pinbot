const mongoose = require('mongoose');

const serverConfigSchema = new mongoose.Schema({
    serverId: { type: String, required: true, unique: true },
    serverName: { type: String, required: true },
    special1mRoleId: { type: String, required: true },
    special1mRoleName: { type: String, required: true },
    special3mRoleId: { type: String, required: true },
    special3mRoleName: { type: String, required: true },
    special1yRoleId: { type: String, required: true },
    special1yRoleName: { type: String, required: true },
    specialLifetimeRoleId: { type: String, required: true },
    specialLifetimeRoleName: { type: String, required: true }
});

const ServerConfig = mongoose.model('ServerConfig', serverConfigSchema);

module.exports = ServerConfig;
