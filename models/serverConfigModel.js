const mongoose = require('mongoose');

const serverConfigSchema = new mongoose.Schema({
    serverId: { type: String, required: true, unique: true },
    ownerRoleName: { type: String, required: true },
    specialRoles: [{ name: String, durationDays: Number }]
});

const ServerConfig = mongoose.model('ServerConfig', serverConfigSchema);

module.exports = ServerConfig;
