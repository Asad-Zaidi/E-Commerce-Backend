require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const connectDB = require('./config/db');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const prompt = (question) => {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
};

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
            
            const proceed = await prompt('\nDo you want to create another admin? (yes/no): ');
            if (proceed.toLowerCase() !== 'yes' && proceed.toLowerCase() !== 'y') {
                console.log('\n👋 Exiting without creating new admin.\n');
                rl.close();
                process.exit(0);
            }
        }

        // Get admin details
        console.log('\n📝 Enter Admin Details:\n');
        
        const name = await prompt('   Name: ');
        const email = await prompt('   Email: ');
        const password = await prompt('   Password (min 6 characters): ');

        // Validate inputs
        if (!email || !password) {
            console.log('\n❌ Email and password are required!\n');
            rl.close();
            process.exit(1);
        }

        if (password.length < 6) {
            console.log('\n❌ Password must be at least 6 characters!\n');
            rl.close();
            process.exit(1);
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            console.log('\n❌ A user with this email already exists!\n');
            rl.close();
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
        rl.close();
        await mongoose.connection.close();
        console.log('📴 Database connection closed.\n');
        process.exit(0);
    }
};

// Run the script
initAdmin();
