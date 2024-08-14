
const mongoose = require('mongoose');

const pinSchema = new mongoose.Schema({
  pin: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  userTag: { type: String, required: true },
  roleName: { type: String, required: true },
  roleId: { type: String, required: true },
  expirationDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  status: { type: String, default: 'active' }, // e.g., 'active', 'expired', 'archived'
  metadata: { type: mongoose.Schema.Types.Mixed } // Additional data if needed
});