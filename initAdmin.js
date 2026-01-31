require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const connectDB = require('./config/db');

const ADMIN_NAME = 'Admin';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin123';

const initAdmin = async () => {
    try {
        console.log('\n🚀 Admin Initialization Script\n');
        console.log('================================\n');

        // Connect to database
        await connectDB();
        console.log('\n');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ role: 'admin' });
        if (existingAdmin) {
            console.log('⚠️  An admin user already exists:');
            console.log(`   Email: ${existingAdmin.email}`);
            console.log(`   Name: ${existingAdmin.name || 'N/A'}`);
            
            console.log('\n👋 Exiting without creating new admin.\n');
            process.exit(0);
        }

        // Hardcoded admin details
        const name = ADMIN_NAME;
        const email = ADMIN_EMAIL;
        const password = ADMIN_PASSWORD;

        // Validate inputs
        if (!email || !password) {
            console.log('\n❌ Email and password are required!\n');
            process.exit(1);
        }

        if (password.length < 6) {
            console.log('\n❌ Password must be at least 6 characters!\n');
            process.exit(1);
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            console.log('\n❌ A user with this email already exists!\n');
            process.exit(1);
        }

        // Hash password and create admin
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const admin = await User.create({
            name: name || 'Admin',
            email: email.toLowerCase(),
            password: hashedPassword,
            role: 'admin'
        });

        console.log('\n✅ Admin created successfully!\n');
        console.log('================================');
        console.log(`   ID: ${admin._id}`);
        console.log(`   Name: ${admin.name}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Role: ${admin.role}`);
        console.log('================================\n');

    } catch (error) {
        console.error('\n❌ Error:', error.message, '\n');
    } finally {
        await mongoose.connection.close();
        console.log('📴 Database connection closed.\n');
        process.exit(0);
    }
};

// Run the script
initAdmin();
