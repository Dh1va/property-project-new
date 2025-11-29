// server/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import sellerRoutes from "./routes/sellerRoutes.js";
import propertyRoutes from "./routes/propertyRoutes.js";
import enquiryRoutes from "./routes/enquiryRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";

dotenv.config();
connectDB();

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://property-site-peach.vercel.app"],
    credentials: true,
  })
);
app.use(express.json());

// Dev logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/sellers", sellerRoutes);
app.use("/api/properties", propertyRoutes);

app.use("/api", locationRoutes);

// Enquiries (single collection)
app.use("/api/enquiry", enquiryRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack || err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
