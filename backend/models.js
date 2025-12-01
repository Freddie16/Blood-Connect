import mongoose from 'mongoose';

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
  distanceKm: Number,
  timestamp: { type: Date, default: Date.now },
  isRsvped: { type: Boolean, default: false }
});

export const Inventory = mongoose.model('Inventory', InventorySchema);
export const Appointment = mongoose.model('Appointment', AppointmentSchema);
export const Alert = mongoose.model('Alert', AlertSchema);
