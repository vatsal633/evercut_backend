
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/dbConnect.js";

// User routes
import userAuthRoutes from "./routes/user/auth/userAuth.routes.js";

// Barber routes
import barberAuthRoutes from "./routes/barber/auth/barberAuth.routes.js";
import barberProfileRoutes from "./routes/barber/profile/barberProfile.routes.js";
import barberBusinessRoutes from "./routes/barber/business/barberBusiness.routes.js";

// Legacy routes (to be refactored later)
import router2 from "./routes/serviceRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";

dotenv.config();

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 5001;

connectDB();

app.use(cors());
app.use(express.json());

// User API routes
app.use("/api/user/auth", userAuthRoutes);

// Barber API routes  
app.use("/api/barber/auth", barberAuthRoutes);
app.use("/api/barber/profile", barberProfileRoutes);
app.use("/api/barber/business", barberBusinessRoutes);

// Legacy routes (to be refactored)
app.use("/api/service", router2);
app.use('/api/employees', employeeRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
