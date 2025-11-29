// server/routes/sellerRoutes.js
import express from "express";
import Seller from "../models/Seller.js";
import Property from "../models/Property.js";
import generateToken from "../utils/generateToken.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* -------- SELLER REGISTER ---------- */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, confirmPassword, company, phone, city, pincode } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "Name, email and password are required." });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    const exists = await Seller.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already registered" });

    const seller = new Seller({
      name,
      email,
      password,
      company,
      phone,
      city,
      pincode,
      isActive: false, // admin must activate
    });

    await seller.save();

    res.json({ success: true, message: "Registered. Wait for admin activation." });
  } catch (err) {
    console.error("Seller register error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* -------- SELLER LOGIN ---------- */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const seller = await Seller.findOne({ email });
    if (!seller) return res.status(400).json({ message: "Invalid credentials" });

    const ok = await seller.matchPassword(password);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(seller._id, "seller");

    res.json({
      token,
      role: "seller",
      isActive: !!seller.isActive,
      name: seller.name,
      seller: {
        _id: seller._id,
        email: seller.email,
        name: seller.name,
        company: seller.company,
        phone: seller.phone,
        city: seller.city,
        pincode: seller.pincode,
      },
    });
  } catch (err) {
    console.error("Seller login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* -------- GET LOGGED-IN SELLER PROFILE ---------- */
router.get("/me", protect, async (req, res) => {
  try {
    if (req.user.role !== "seller") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const seller = await Seller.findById(req.user.id).select("-password");
    if (!seller) return res.status(404).json({ message: "Seller not found" });

    res.json(seller);
  } catch (err) {
    console.error("Get /me seller error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* -------- GET PROPERTIES OF LOGGED-IN SELLER ---------- */
// This is what MyProperties.jsx is calling: GET /api/sellers/me/properties
router.get("/me/properties", protect, async (req, res) => {
  try {
    if (req.user.role !== "seller") {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Only properties belonging to this seller
    const props = await Property.find({ seller: req.user.id })
      .sort({ createdAt: -1 });

    res.json(props);
  } catch (err) {
    console.error("Get seller properties error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
