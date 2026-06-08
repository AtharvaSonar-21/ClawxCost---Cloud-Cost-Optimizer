import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Lead from './src/models/Lead.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function run() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Successfully connected!');

    const leads = await Lead.find({});
    console.log('\n=========================================');
    console.log(`🔍 CURRENT EMAIL LEADS IN MONGODB (${leads.length} found):`);
    console.log('=========================================');
    leads.forEach((l, index) => {
      console.log(`[${index + 1}] Email: ${l.email} | Status: ${l.status} | Registered: ${l.createdAt}`);
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
