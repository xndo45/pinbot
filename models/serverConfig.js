const mongoose = require('mongoose');

const serverConfigSchema = new mongoose.Schema({
  serverId: { type: String, required: true, unique: true },
  serverName: { type: String, required: true },
  roles: {
    special1m: {
      roleId: { type: String, required: true },
      roleName: { type: String, required: true }
    },
    special3m: {
      roleId: { type: String, required: true },
      roleName: { type: String, required: true }
    },
    special1y: {
      roleId: { type: String, required: true },
      roleName: { type: String, required: true }
    },
    specialLifetime: {
      roleId: { type: String, required: true },
      roleName: { type: String, required: true }
    }
  }
});

const ServerConfig = mongoose.model('ServerConfig', serverConfigSchema);

module.exports = ServerConfig;
