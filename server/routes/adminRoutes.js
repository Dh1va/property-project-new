// server/routes/adminRoutes.js
import express from "express";
import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";
import Seller from "../models/Seller.js";
import Property from "../models/Property.js";
import generateToken from "../utils/generateToken.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/** ADMIN LOGIN */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: "Invalid credentials" });
    const ok = await bcrypt.compare(password, admin.password);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });
    const token = generateToken(admin._id, "admin");
    res.json({ token, role: "admin", name: admin.name, admin: { _id: admin._id, email: admin.email, name: admin.name } });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/** GET all active sellers (admin) */
router.get("/sellers", protect, adminOnly, async (req, res) => {
  try {
    const sellers = await Seller.find({ isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .select("-password");
    res.json(sellers);
  } catch (err) {
    console.error("Get sellers error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/** GET deleted sellers (admin) */
router.get("/sellers/deleted", protect, adminOnly, async (req, res) => {
  try {
    const sellers = await Seller.find({ isDeleted: true })
      .sort({ createdAt: -1 })
      .select("-password");
    res.json(sellers);
  } catch (err) {
    console.error("Get deleted sellers error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/** GET single seller (admin) */
router.get("/sellers/:id", protect, adminOnly, async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id).select("-password");
    if (!seller) return res.status(404).json({ message: "Seller not found" });
    res.json(seller);
  } catch (err) {
    console.error("Get seller error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/** ACTIVATE / DEACTIVATE seller */
router.put("/sellers/:id/activate", protect, adminOnly, async (req, res) => {
  try {
    const { activate } = req.body;
    const seller = await Seller.findById(req.params.id);
    if (!seller) return res.status(404).json({ message: "Seller not found" });
    seller.isActive = !!activate;
    await seller.save();
    res.json({ success: true });
  } catch (err) {
    console.error("Activate seller error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/** CREATE seller (admin) */
router.post("/sellers", protect, adminOnly, async (req, res) => {
  try {
    const { name, email, password, company, phone = "", city = "", pincode = "", isActive = true } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Name, email and password required" });
    const exists = await Seller.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already used" });
    const seller = new Seller({ name, email, password, company, phone, city, pincode, isActive });
    await seller.save();
    const saved = await Seller.findById(seller._id).select("-password");
    res.json({ success: true, seller: saved });
  } catch (err) {
    console.error("Create seller error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/** UPDATE seller (admin) */
router.put("/sellers/:id", protect, adminOnly, async (req, res) => {
  try {
    const { name, email, company, phone, city, pincode, isActive, password } = req.body;
    const seller = await Seller.findById(req.params.id);
    if (!seller) return res.status(404).json({ message: "Seller not found" });

    seller.name = name ?? seller.name;
    seller.email = email ?? seller.email;
    seller.company = company ?? seller.company;
    seller.phone = phone ?? seller.phone;
    seller.city = city ?? seller.city;
    seller.pincode = pincode ?? seller.pincode;
    seller.isActive = typeof isActive === "boolean" ? isActive : seller.isActive;

    if (password) seller.password = password; // pre-save hook will hash

    await seller.save();

    const updated = await Seller.findById(seller._id).select("-password");
    res.json({ success: true, seller: updated });
  } catch (err) {
    console.error("Update seller error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/** GET properties by seller (admin) */
router.get("/sellers/:id/properties", protect, adminOnly, async (req, res) => {
  try {
    const sellerId = req.params.id;
    const properties = await Property.find({ seller: sellerId }).sort({ createdAt: -1 });
    res.json(properties);
  } catch (err) {
    console.error("Get seller properties error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/** Soft-delete property (admin) */
router.put("/properties/:id/soft-delete", protect, adminOnly, async (req, res) => {
  try {
    const prop = await Property.findById(req.params.id);
    if (!prop) return res.status(404).json({ message: "Property not found" });
    prop.status = "inactive";
    prop.ownerRemoved = true;
    prop.deletedAt = new Date();
    await prop.save();
    res.json({ success: true, property: prop });
  } catch (err) {
    console.error("Soft-delete property error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/** Restore property (admin) */
router.put("/properties/:id/restore", protect, adminOnly, async (req, res) => {
  try {
    const prop = await Property.findById(req.params.id);
    if (!prop) return res.status(404).json({ message: "Property not found" });
    prop.status = "active";
    prop.ownerRemoved = false;
    prop.deletedAt = undefined;
    await prop.save();
    res.json({ success: true, property: prop });
  } catch (err) {
    console.error("Restore property error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/** Bulk: soft-delete all properties for a seller (admin) */
router.put("/sellers/:id/properties/soft-delete-all", protect, adminOnly, async (req, res) => {
  try {
    const sellerId = req.params.id;
    await Property.updateMany(
      { seller: sellerId },
      { $set: { status: "inactive", ownerRemoved: true, deletedAt: new Date() } }
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Soft-delete-all props error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/** Bulk: restore all properties for a seller (admin) */
router.put("/sellers/:id/properties/restore-all", protect, adminOnly, async (req, res) => {
  try {
    const sellerId = req.params.id;
    await Property.updateMany(
      { seller: sellerId, ownerRemoved: true },
      { $set: { status: "active", ownerRemoved: false }, $unset: { deletedAt: "" } }
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Restore-all props error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/** DELETE seller (soft-delete by default / hard-delete optional) */
router.delete("/sellers/:id", protect, adminOnly, async (req, res) => {
  try {
    const { hard, removeAssets } = req.query;
    const seller = await Seller.findById(req.params.id);
    if (!seller) return res.status(404).json({ message: "Seller not found" });

    if (hard === "true") {
      const properties = await Property.find({ seller: seller._id });
      if (removeAssets === "true") {
        // enqueue asset deletion in background if needed
      }
      await Property.deleteMany({ seller: seller._id });
      await Seller.deleteOne({ _id: seller._id });
      return res.json({ success: true, message: "Seller permanently deleted" });
    }

    // SOFT delete seller + soft-delete their properties
    seller.isDeleted = true;
    seller.isActive = false;
    await seller.save();

    await Property.updateMany(
      { seller: seller._id },
      { $set: { status: "inactive", ownerRemoved: true, deletedAt: new Date() } }
    );

    res.json({ success: true, message: "Seller soft-deleted" });
  } catch (err) {
    console.error("Delete seller error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/** Restore seller (undo soft-delete) */
router.put("/sellers/:id/restore", protect, adminOnly, async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);
    if (!seller) return res.status(404).json({ message: "Seller not found" });
    if (!seller.isDeleted) return res.status(400).json({ message: "Seller is not deleted" });

    seller.isDeleted = false;
    // policy: set active true on restore. If you prefer manual activation, set false.
    seller.isActive = true;
    await seller.save();

    // restore properties that were hidden due to ownerRemoved
    await Property.updateMany(
      { seller: seller._id, ownerRemoved: true },
      { $set: { status: "active", ownerRemoved: false }, $unset: { deletedAt: "" } }
    );

    const restored = await Seller.findById(seller._id).select("-password");
    res.json({ success: true, seller: restored });
  } catch (err) {
    console.error("Restore seller error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* -------------------- NEW: Pending / Approve / Reject property endpoints -------------------- */

/** GET pending properties (admin) */
router.get("/properties/pending", protect, adminOnly, async (req, res) => {
  try {
    const pending = await Property.find({ status: "pending" })
      .sort({ submittedAt: -1 })
      .populate("seller", "name email");
    res.json(pending);
  } catch (err) {
    console.error("Get pending properties error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/** Approve property (admin) */
router.put("/properties/:id/approve", protect, adminOnly, async (req, res) => {
  try {
    const prop = await Property.findById(req.params.id);
    if (!prop) return res.status(404).json({ message: "Property not found" });

    prop.status = "active";
    prop.publishedAt = new Date();
    prop.rejectionReason = "";
    await prop.save();

    // TODO: notify seller via email/in-app if you have notifications
    res.json({ success: true, property: prop });
  } catch (err) {
    console.error("Approve property error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/** Reject property (admin) */
router.put("/properties/:id/reject", protect, adminOnly, async (req, res) => {
  try {
    const { reason } = req.body;
    const prop = await Property.findById(req.params.id);
    if (!prop) return res.status(404).json({ message: "Property not found" });

    prop.status = "rejected";
    prop.rejectionReason = reason || "Rejected by admin";
    await prop.save();

    // TODO: notify seller with reason
    res.json({ success: true, property: prop });
  } catch (err) {
    console.error("Reject property error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ------------------------------------------------------------------------------------------- */

export default router;
