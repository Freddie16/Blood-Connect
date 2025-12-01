import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5001;

// Enhanced CORS configuration
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));

app.use(express.json());

// Add request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Database Connection
const MONGO_URI = 'mongodb+srv://freddiemurigi_db_user:EhTvnBZWLhMOdpfr@cluster0.wktkrqb.mongodb.net/';

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ MongoDB Connected successfully');
        await seedData();
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err.message);
        console.log('Retrying connection in 5 seconds...');
        setTimeout(connectDB, 5000);
    }
};

connectDB();

// Schemas
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

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  bloodGroup: String,
  county: String,
  organization: String, // For staff users
  userType: { type: String, enum: ['donor', 'staff'], default: 'donor' },
  isVerified: { type: Boolean, default: false },
  totalDonations: { type: Number, default: 0 },
  lastDonationDate: Date,
  location: {
    lat: Number,
    lng: Number
  },
  createdAt: { type: Date, default: Date.now }
});

const Inventory = mongoose.model('Inventory', InventorySchema);
const Appointment = mongoose.model('Appointment', AppointmentSchema);
const Alert = mongoose.model('Alert', AlertSchema);
const User = mongoose.model('User', UserSchema);

// --- Seed Data Helper ---
const seedData = async () => {
  try {
    // Seed inventory - start from 0
    const invCount = await Inventory.countDocuments();
    if (invCount === 0) {
      const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
      
      await Inventory.insertMany(bloodGroups.map(bg => ({ 
        bloodGroup: bg,
        units: 0, // Start from 0
        expiringSoon: 0
      })));
      console.log('✅ Inventory Seeded with 0 units');
    }

    // Remove the demo alerts - they won't be created anymore
    const alertCount = await Alert.countDocuments();
    if (alertCount > 0) {
      // Remove existing demo alerts
      await Alert.deleteMany({});
      console.log('✅ Removed demo alerts');
    }

    // Keep demo user but update userType
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await User.create({
        name: 'Demo Donor',
        email: 'donor@example.com',
        password: 'password123',
        phone: '0712345678',
        bloodGroup: 'O+',
        county: 'Nairobi',
        userType: 'donor',
        isVerified: true,
        totalDonations: 0,
        location: {
          lat: -1.286389,
          lng: 36.817223
        }
      });
      
      await User.create({
        name: 'Hospital Staff',
        email: 'staff@example.com',
        password: 'password123',
        phone: '0723456789',
        organization: 'Kenyatta National Hospital',
        userType: 'staff',
        isVerified: true,
        location: {
          lat: -1.3041,
          lng: 36.8060
        }
      });
      console.log('✅ Demo Users Seeded');
    }
  } catch (err) {
    console.error('✗ Seeding Error:', err);
  }
};
// --- Health Check ---
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// --- Authentication Routes ---
// Fix the signup endpoint
app.post('/api/auth/signup', async (req, res) => {
  try {
    console.log('Signup request received:', req.body);
    const { name, email, password, phone, bloodGroup, county, organization, userType } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    const user = new User({
      name,
      email,
      password, // In production, hash this password
      phone,
      bloodGroup,
      county,
      organization,
      userType: userType || 'donor'
    });

    await user.save();
    console.log('User created successfully:', user.email);

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        bloodGroup: user.bloodGroup,
        county: user.county,
        organization: user.organization,
        userType: user.userType,
        isVerified: user.isVerified,
        totalDonations: user.totalDonations
      }
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Fix login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('Login request received:', req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        bloodGroup: user.bloodGroup,
        county: user.county,
        organization: user.organization,
        userType: user.userType,
        isVerified: user.isVerified,
        totalDonations: user.totalDonations,
        location: user.location
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// --- User Routes ---
app.get('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }
        
        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                bloodGroup: user.bloodGroup,
                county: user.county,
                isVerified: user.isVerified,
                totalDonations: user.totalDonations,
                location: user.location
            }
        });
    } catch (err) {
        console.error('Get user error:', err);
        res.status(500).json({ 
            success: false,
            error: err.message 
        });
    }
});

app.patch('/api/users/:id', async (req, res) => {
    try {
        const { name, phone, bloodGroup, county, location } = req.body;
        
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { name, phone, bloodGroup, county, location },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                bloodGroup: user.bloodGroup,
                county: user.county,
                isVerified: user.isVerified,
                totalDonations: user.totalDonations,
                location: user.location
            }
        });
    } catch (err) {
        console.error('Update user error:', err);
        res.status(500).json({ 
            success: false,
            error: err.message 
        });
    }
});

// --- Donor Location Routes ---
app.get('/api/donors/nearby', async (req, res) => {
    try {
        const { lat, lng, radius = 10, bloodGroup } = req.query;
        
        if (!lat || !lng) {
            return res.status(400).json({ 
                success: false,
                message: 'Latitude and longitude are required' 
            });
        }

        const userLat = parseFloat(lat);
        const userLng = parseFloat(lng);
        const searchRadius = parseFloat(radius);

        // Simple distance calculation (for demo - in production use MongoDB geospatial queries)
        const allDonors = await User.find({ 
            ...(bloodGroup && { bloodGroup })
        });

        const nearbyDonors = allDonors.filter(donor => {
            if (!donor.location || !donor.location.lat || !donor.location.lng) return false;
            
            const distance = calculateDistance(
                userLat, userLng,
                donor.location.lat, donor.location.lng
            );
            
            return distance <= searchRadius;
        }).map(donor => ({
            id: donor._id,
            name: donor.name,
            bloodGroup: donor.bloodGroup,
            distance: calculateDistance(userLat, userLng, donor.location.lat, donor.location.lng),
            location: donor.location,
            totalDonations: donor.totalDonations,
            isVerified: donor.isVerified
        }));

        res.json({
            success: true,
            donors: nearbyDonors
        });
    } catch (err) {
        console.error('Nearby donors error:', err);
        res.status(500).json({ 
            success: false,
            error: err.message 
        });
    }
});

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// --- Inventory Routes ---
app.post('/api/inventory', async (req, res) => {
  const { bloodGroup, change } = req.body;
  try {
    const item = await Inventory.findOne({ bloodGroup });
    if (item) {
      item.units = Math.max(0, item.units + change);
      item.lastUpdated = new Date();
      await item.save();
      
      res.json({
        success: true,
        item: item
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Blood group not found'
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});
// --- Appointment Routes ---
app.get('/api/appointments', async (req, res) => {
    try {
        const appointments = await Appointment.find().sort({ date: 1 });
        res.json({
            success: true,
            appointments: appointments
        });
    } catch (err) {
        res.status(500).json({ 
            success: false,
            error: err.message 
        });
    }
});

app.post('/api/appointments', async (req, res) => {
    try {
        const newAppointment = new Appointment(req.body);
        await newAppointment.save();
        res.status(201).json({
            success: true,
            appointment: newAppointment
        });
    } catch (err) {
        res.status(500).json({ 
            success: false,
            error: err.message 
        });
    }
});

// Fix appointment status update
app.patch('/api/appointments/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedAppointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      appointment: updatedAppointment
    });
  } catch (err) {
    console.error('Update appointment error:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// --- Alert Routes ---
// Add this route before the catch-all route
// In server.js, update the alert creation route
// Fix alert creation route

// Fix create alert route to include all necessary fields
app.post('/api/alerts', async (req, res) => {
  try {
    const { 
      hospitalName, 
      location, 
      bloodGroup, 
      urgency, 
      requiredUnits, 
      description, 
      contactInfo, 
      organization, 
      createdBy 
    } = req.body;

    // Validate required fields
    if (!hospitalName || !location || !bloodGroup || !urgency || !requiredUnits) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Calculate distance (simplified)
    const distanceKm = Math.random() * 10 + 1;
    
    const newAlert = new Alert({
      hospitalName,
      location,
      bloodGroup: Array.isArray(bloodGroup) ? bloodGroup : [bloodGroup],
      urgency,
      requiredUnits: parseInt(requiredUnits),
      description: description || '',
      contactInfo: contactInfo || '',
      organization: organization || '',
      createdBy: createdBy || '',
      distanceKm: Math.round(distanceKm * 10) / 10,
      collectedUnits: 0,
      isRsvped: false,
      timestamp: new Date()
    });

    await newAlert.save();

    console.log('New alert created successfully:', newAlert._id);

    res.status(201).json({
      success: true,
      alert: newAlert
    });
  } catch (err) {
    console.error('Create alert error:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Fix get alerts route to return all alerts
// Fix get alerts for staff - ensure it returns all alerts
app.get('/api/alerts', async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ timestamp: -1 });
    res.json({
      success: true,
      alerts: alerts
    });
  } catch (err) {
    console.error('Get alerts error:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});
app.use('/api', (req, res) => {
    res.status(404).json({ 
        success: false,
        message: `API endpoint ${req.method} ${req.originalUrl} not found` 
    });
});

// Basic 404 handler for non-API routes
app.use((req, res) => {
    res.status(404).json({ 
        success: false,
        message: 'Route not found' 
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ 
        success: false,
        message: 'Internal server error' 
    });
});

// Add these routes before the catch-all route

// --- Update User Location ---
app.patch('/api/users/:id/location', async (req, res) => {
    try {
        const { lat, lng } = req.body;
        
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { location: { lat, lng } },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                location: user.location
            }
        });
    } catch (err) {
        console.error('Update location error:', err);
        res.status(500).json({ 
            success: false,
            error: err.message 
        });
    }
});

// --- Search Alerts ---
app.get('/api/alerts/search', async (req, res) => {
    try {
        const { query, bloodGroup } = req.query;
        let searchCriteria = {};

        if (query) {
            searchCriteria.$or = [
                { hospitalName: { $regex: query, $options: 'i' } },
                { location: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ];
        }

        if (bloodGroup) {
            searchCriteria.bloodGroup = bloodGroup;
        }

        const alerts = await Alert.find(searchCriteria).sort({ timestamp: -1 });
        
        res.json({
            success: true,
            alerts: alerts
        });
    } catch (err) {
        console.error('Search alerts error:', err);
        res.status(500).json({ 
            success: false,
            error: err.message 
        });
    }
});

// --- Get User Notifications ---
app.get('/api/users/:id/notifications', async (req, res) => {
    try {
        // For now, return recent critical alerts as notifications
        const notifications = await Alert.find({ 
            urgency: 'Critical',
            timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
        }).sort({ timestamp: -1 }).limit(5);

        res.json({
            success: true,
            notifications: notifications.map(alert => ({
                id: alert._id,
                type: 'alert',
                title: `Critical Need: ${alert.bloodGroup.join(', ')}`,
                message: alert.description,
                timestamp: alert.timestamp,
                read: false
            }))
        });
    } catch (err) {
        console.error('Get notifications error:', err);
        res.status(500).json({ 
            success: false,
            error: err.message 
        });
    }
});

// --- RSVP to Alert ---
// Fix RSVP route
app.post('/api/alerts/:id/rsvp', async (req, res) => {
  try {
    const { userId } = req.body;
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    // Increment collected units and mark as RSVPed
    alert.collectedUnits += 1;
    alert.isRsvped = true;
    await alert.save();

    res.json({
      success: true,
      alert: alert
    });
  } catch (err) {
    console.error('RSVP error:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 API endpoint: http://localhost:${PORT}/api`);
    console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
});