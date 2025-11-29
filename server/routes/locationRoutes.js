// server/routes/locationRoutes.js
import express from "express";
import Property from "../models/Property.js"; 
// ⬆️ make sure this path & filename matches your real model file

const router = express.Router();

// GET /api/locations?search=ch
router.get("/locations", async (req, res) => {
  try {
    const search = (req.query.search || "").trim();

    if (!search) {
      return res.json([]);
    }

    const regex = new RegExp(search, "i");

    const props = await Property.find({
      $or: [
        { city: { $regex: regex } },
        { postalCode: { $regex: regex } },
        { zipCode: { $regex: regex } },
        { zip: { $regex: regex } },
        { pincode: { $regex: regex } },
      ],
    })
      .select("city postalCode zipCode zip pincode")
      .limit(200);

    const seen = new Set();
    const results = [];

    for (const p of props) {
      const city = p.city || "";
      const postal =
        p.postalCode || p.zipCode || p.zip || p.pincode || "";

      if (!city && !postal) continue;

      const key = `${postal}-${city}`.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);

      results.push({ city, postalCode: postal });
    }

    results.sort((a, b) => {
      if (a.postalCode && b.postalCode && a.postalCode !== b.postalCode) {
        return String(a.postalCode).localeCompare(String(b.postalCode));
      }
      return (a.city || "").localeCompare(b.city || "");
    });

    res.json(results.slice(0, 20));
  } catch (err) {
    console.error("Error fetching locations:", err);
    res.status(500).json({ message: "Failed to fetch locations" });
  }
});

export default router;
