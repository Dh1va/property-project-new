// routes/authRoutes.js
import express from "express";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import Seller from "../models/Seller.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

router.get("/me", async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) return res.status(401).json({ message: "No token" });
    const token = auth.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Token invalid/expired" });
    }
    const { id, role } = decoded;
    if (!id) return res.status(401).json({ message: "Invalid token payload" });

    if (role === "admin") {
      const admin = await Admin.findById(id).select("-password");
      if (!admin) return res.status(401).json({ message: "Admin not found" });
      return res.json({ id: admin._id, role: "admin", name: admin.username });
    } else {
      const seller = await Seller.findById(id).select("-password");
      if (!seller) return res.status(401).json({ message: "Seller not found" });
      return res.json({ id: seller._id, role: "seller", name: seller.name, isActive: !!seller.isActive, email: seller.email });
    }
  } catch (err) {
    console.error("auth/me error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
