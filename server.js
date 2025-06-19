import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url';
import multer from 'multer'; // ✅ Add this import
import connectDB from "./config/dbConnect.js";
import router from "./routes/userAuthRoutes.js";
import router1 from "./routes/barberAuthRoutes.js";
import router2 from "./routes/serviceRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import photoRoutes from "./routes/photoRoutes.js";

// Get __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase payload limit for photos
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for uploaded photos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use("/api/userauth", router);
app.use("/api/barberauth", router1);
app.use("/api/services", router2);
app.use("/api/employees", employeeRoutes);
app.use("/api/photos", photoRoutes);

// Error handling middleware for multer
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File too large. Maximum size is 5MB per file.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        message: 'Too many files. Maximum 10 files allowed per upload.'
      });
    }
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      message: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'
    });
  }
  
  next(error);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is running successfully!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📁 Photo uploads will be served from: http://localhost:${PORT}/uploads/photos/`);
});