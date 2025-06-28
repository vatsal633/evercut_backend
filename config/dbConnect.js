import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the .env file directly
const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');

// Parse the .env file manually
const envVars = {};
envContent.split('\n').forEach(line => {
    // Find the position of the first equals sign
    const firstEqualsPos = line.indexOf('=');
    if (firstEqualsPos !== -1) {
        const key = line.substring(0, firstEqualsPos).trim();
        const value = line.substring(firstEqualsPos + 1).trim();
        if (key && value) {
            envVars[key] = value;
        }
    }
});

const connectDB= async()=>{
    try{
        // Use the full URI directly from the .env file we read
        const mongoUri = envVars.MONGODB_URI;
        console.log('Connecting to MongoDB with URI:', mongoUri);
        
        // Ensure the URI is properly formatted
        if (mongoUri && mongoUri.includes('retryWrites')) {
            await mongoose.connect(mongoUri);
            console.log('MongoDB connected successfully');
        } else {
            // Fallback to a hardcoded URI as a last resort
            const fallbackUri = "mongodb+srv://UjjwalSharma:1234@cluster0.gliwh6s.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
            console.log('Using fallback MongoDB URI');
            await mongoose.connect(fallbackUri);
            console.log('MongoDB connected successfully using fallback URI');
        }
    }
    catch(err){
        console.log('MongoDB connection error:', err.message);
        process.exit(1);
    }
}

export default connectDB;