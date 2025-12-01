
// This file assumes you have mongoose installed
const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
  bloodGroup: { type: String, required: true, unique: true },
  units: { type: Number, default: 0 },
  expiringSoon: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
});

const AppointmentSchema = new mongoose.Schema({
  donorId: String,
  donorName: String,
  hospitalName: String,
  date: String,
  time: String,
  status: { type: String, enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'], default: 'Pending' },
  bloodGroup: String
});

const AlertSchema = new mongoose.Schema({
  hospitalName: String,
  location: String,
  bloodGroup: [String],
  urgency: { type: String, enum: ['Low', 'Medium', 'Critical'] },
  requiredUnits: Number,
  collectedUnits: { type: Number, default: 0 },
  description: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = {
  Inventory: mongoose.model('Inventory', InventorySchema),
  Appointment: mongoose.model('Appointment', AppointmentSchema),
  Alert: mongoose.model('Alert', AlertSchema)
};
