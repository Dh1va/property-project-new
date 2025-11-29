// routes/propertyRoutes.js
import express from "express";
import Property from "../models/Property.js";
import Seller from "../models/Seller.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadCloudinary.js";

const router = express.Router();

/* ---------------------- GET ALL (public) ---------------------- */
/* returns only active properties by default. Admins should use admin routes to get others. */
router.get("/", async (req, res) => {
  try {
    const q = {};
    if (req.query.status) {
      q.status = req.query.status;
    } else {
      q.status = "active";
    }

    // Optionally support city/country filters etc via query (quick examples)
    if (req.query.city) q.city = req.query.city;
    if (req.query.country) q.country = req.query.country;

    const props = await Property.find(q).populate("seller", "name email");
    res.json(props);
  } catch (err) {
    console.error("get properties error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ---------------------- GET SINGLE ---------------------- */
router.get("/:id", async (req, res) => {
  try {
    const prop = await Property.findById(req.params.id).populate("seller", "name email");
    if (!prop) return res.status(404).json({ message: "Not found" });
    res.json(prop);
  } catch (err) {
    console.error("get property error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ---------------------- CREATE PROPERTY ---------------------- */
router.post("/", protect, upload.array("images", 10), async (req, res) => {
  try {
    const role = req.user.role;

    // Parse images from Cloudinary
    const imageUrls = (req.files || []).map((f) => f.path);
    const payload = { ...req.body };

    if (payload.amenities && typeof payload.amenities === "string") {
      payload.amenities = payload.amenities
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);
    }

    // Normalize agentNumber if present (keep as string)
    if (payload.agentNumber) payload.agentNumber = String(payload.agentNumber).trim();

    // Seller flow
    if (role === "seller") {
      const seller = await Seller.findById(req.user.id);

      if (!seller) return res.status(404).json({ message: "Seller not found" });
      if (seller.isDeleted) return res.status(403).json({ message: "Seller account deleted" });
      if (!seller.isActive) return res.status(403).json({ message: "Seller is not activated" });

      payload.seller = seller._id;
      // Force create as pending — admin must approve
      payload.status = "pending";
      payload.submittedBy = seller._id;
      payload.submittedAt = new Date();
    }

    // Admin flow
    if (role === "admin") {
      // Optional: admin may pass a sellerId to assign property to a seller
      if (payload.sellerId) {
        const seller = await Seller.findById(payload.sellerId);
        if (!seller) return res.status(404).json({ message: "Seller not found" });
        if (seller.isDeleted) return res.status(403).json({ message: "Seller account deleted" });
        if (!seller.isActive) return res.status(403).json({ message: "Seller is not activated" });

        payload.seller = seller._id;
      }
      // Admin-created properties may be published immediately (active) or pending depending on payload
      payload.status = payload.status === "pending" ? "pending" : "active";
      if (payload.status === "active") payload.publishedAt = new Date();
    }

    // If neither admin nor seller
    if (role !== "admin" && role !== "seller") {
      return res.status(403).json({ message: "Not allowed to create properties" });
    }

    if (imageUrls.length) payload.images = imageUrls;

    const prop = new Property(payload);
    await prop.save();

    res.status(201).json({ success: true, property: prop });
  } catch (err) {
    console.error("create prop error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ---------------------- UPDATE PROPERTY ---------------------- */
router.put("/:id", protect, upload.array("images", 10), async (req, res) => {
  try {
    const prop = await Property.findById(req.params.id);
    if (!prop) return res.status(404).json({ message: "Not found" });

    // Seller can only modify own props (admin bypasses)
    if (req.user.role === "seller") {
      if (prop.seller && prop.seller.toString() !== req.user.id) {
        return res.status(403).json({ message: "Not allowed" });
      }

      const seller = await Seller.findById(req.user.id);
      if (!seller || !seller.isActive || seller.isDeleted) {
        return res.status(403).json({ message: "Seller is not active or deleted" });
      }
    }

    const imageUrls = (req.files || []).map((f) => f.path);
    if (imageUrls.length) prop.images = imageUrls;

    // Whitelist allowed update fields from payload for safety
    const payload = { ...req.body };
    if (payload.amenities && typeof payload.amenities === "string") {
      payload.amenities = payload.amenities
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);
    }

    // Sellers cannot change workflow fields directly
    if (req.user.role === "seller") {
      delete payload.status;
      delete payload.publishedAt;
      delete payload.submittedBy;
      delete payload.submittedAt;
      delete payload.rejectionReason;
      delete payload.ownerRemoved;
      delete payload.deletedAt;
    }

    // Admin can change status/publish, so if admin sets status->active set publishedAt
    if (req.user.role === "admin" && payload.status === "active") {
      payload.publishedAt = new Date();
      payload.rejectionReason = "";
    }

    // allow agentNumber update
    if (payload.agentNumber !== undefined) {
      payload.agentNumber = String(payload.agentNumber).trim();
    }

    Object.assign(prop, payload);
    await prop.save();
    res.json({ success: true, property: prop });
  } catch (err) {
    console.error("update prop error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ---------------------- DELETE PROPERTY ---------------------- */
router.delete("/:id", protect, async (req, res) => {
  try {
    const prop = await Property.findById(req.params.id);
    if (!prop) return res.status(404).json({ message: "Not found" });

    if (req.user.role === "seller") {
      if (prop.seller && prop.seller.toString() !== req.user.id) {
        return res.status(403).json({ message: "Not allowed" });
      }

      const seller = await Seller.findById(req.user.id);
      if (!seller || !seller.isActive || seller.isDeleted) {
        return res.status(403).json({ message: "Seller is not active or deleted" });
      }
    }

    await prop.deleteOne();
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    console.error("delete prop error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
