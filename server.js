
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/dbConnect.js";
import router from "./routes/userAuthRoutes.js";
import router1 from "./routes/barberAuthRoutes.js";
import router2 from "./routes/serviceRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";


dotenv.config();

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 5001;

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/barberauth", router1);
app.use("/api/userauth", router);
app.use("/api/service", router2)
// app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
