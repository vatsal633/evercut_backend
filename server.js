import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/dbConnect.js";
import router from "./routes/userAuthRoutes.js";
import router1 from "./routes/barberAuthRoutes.js";
import router2 from "./routes/serviceRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/userauth", router);
app.use("/api/barberauth", router1);
app.use("/api/services", router2);
app.use("/api/employees", employeeRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
