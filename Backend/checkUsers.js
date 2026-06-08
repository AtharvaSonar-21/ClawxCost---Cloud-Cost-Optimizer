import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function run() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Successfully connected!');

    const users = await User.find({});
    console.log('\n=========================================');
    console.log(`👤 CURRENT REGISTERED USERS IN MONGODB (${users.length} found):`);
    console.log('=========================================');
    users.forEach((u, index) => {
      console.log(`[${index + 1}] Name: ${u.name} | Email: ${u.email} | Role: ${u.role} | Registered: ${u.createdAt}`);
    });
    console.log('=========================================\n');

    await mongoose.disconnect();
    console.log('Disconnected.');
  } catch (error) {
    console.error('Error querying database:', error);
    process.exit(1);
  }
}

run();
