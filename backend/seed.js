const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB for Seeding...'))
  .catch((err) => console.log('DB Connection Error:', err));

const createAdmin = async () => {
  try {
    // Check if an admin already exists
    const adminExists = await User.findOne({ email: 'devansh@gmail.com' });
    
    if (adminExists) {
      console.log('Admin user already exists! Email: devansh@gmail.com');
      process.exit();
    }

    // Create the new Admin user
    const adminUser = new User({
      name: 'System Admin',
      email: 'devansh@gmail.com',
      password: 'dev@123', // Will be hashed automatically by the pre-save hook
      role: 'Admin'
    });

    await adminUser.save();
    console.log('✅ Admin account created successfully!');
    console.log('Email: devansh@gmail.com');
    console.log('Password: dev@123');
    process.exit();
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
