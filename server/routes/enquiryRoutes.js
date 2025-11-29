// server/routes/enquiryRoutes.js
import express from "express";
import nodemailer from "nodemailer";
import Enquiry from "../models/Enquiry.js";
import Property from "../models/Property.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Helper: reference numbers
const genRef = (prefix = "GEN") => {
  const y = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${y}-${rand}`;
};

// POST /api/enquiry
// Public route for both property enquiries and general enquiries.
router.post("/", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      message,
      propertyTitle,
      propertyRef,   // client may send property refNumber OR nothing
      propertyId,    // NEW: client can send property _id
    } = req.body;

    if (!name || !email || !message) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    let propertyDoc = null;
    let finalPropertyTitle = propertyTitle;
    let finalPropertyRef = propertyRef;

    // If propertyId is sent, attach real property
    if (propertyId) {
      try {
        propertyDoc = await Property.findById(propertyId).select("title refNumber");
      } catch (err) {
        console.error("enquiry property lookup error:", err);
      }
    }

    if (propertyDoc) {
      if (!finalPropertyTitle) finalPropertyTitle = propertyDoc.title;
      if (!finalPropertyRef) finalPropertyRef = propertyDoc.refNumber;
    }

    const isPropertyEnquiry = !!(propertyDoc || propertyTitle || propertyRef);

    const refNumber = genRef(isPropertyEnquiry ? "PROP" : "GEN");

    // Save to DB
    const enquiry = await Enquiry.create({
      refNumber,
      property: propertyDoc ? propertyDoc._id : null,
      propertyRef: finalPropertyRef || null,
      propertyTitle:
        finalPropertyTitle ||
        (isPropertyEnquiry ? "Property Enquiry" : "General Enquiry"),
      name,
      email,
      phone,
      message,
    });

    // optional: send emails (if MAIL_USER / MAIL_PASS / ADMIN_EMAIL configured)
    if (process.env.MAIL_USER && process.env.MAIL_PASS && process.env.ADMIN_EMAIL) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
          },
        });

        const adminMail = {
          from: process.env.MAIL_USER,
          to: process.env.ADMIN_EMAIL,
          subject: `New Enquiry - ${finalPropertyTitle || "General"}`,
          html: `
            <h3>New Enquiry</h3>
            <p><b>Ref:</b> ${refNumber}</p>
            ${
              finalPropertyRef
                ? `<p><b>Property Ref:</b> ${finalPropertyRef}</p>`
                : ""
            }
            <p><b>Property:</b> ${finalPropertyTitle || "General"}</p>
            <p><b>Name:</b> ${name}</p>
            <p><b>Email:</b> ${email}</p>
            <p><b>Phone:</b> ${phone || "N/A"}</p>
            <p><b>Message:</b><br/>${message}</p>
          `,
        };

        const userMail = {
          from: process.env.MAIL_USER,
          to: email,
          subject: "We received your enquiry",
          html: `
            <h3>Hello ${name},</h3>
            <p>Thanks for reaching out. We've recorded your enquiry with reference <b>${refNumber}</b>.</p>
            ${
              finalPropertyRef
                ? `<p>We linked this to property <b>${finalPropertyRef}</b>.</p>`
                : ""
            }
            <p>We'll contact you shortly.</p>
          `,
        };

        await transporter.sendMail(adminMail);
        await transporter.sendMail(userMail);
      } catch (mailErr) {
        console.error("enquiry email error:", mailErr);
        // do not fail the request if email fails
      }
    }

    res.json({ success: true, refNumber: enquiry.refNumber });
  } catch (err) {
    console.error("enquiry create error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to create enquiry" });
  }
});

// GET /api/enquiry
// Admin list all enquiries (protected)
router.get("/", protect, requireRole("admin"), async (req, res) => {
  try {
    const enquiries = await Enquiry.find()
      .sort({ createdAt: -1 })
      .populate("property", "title refNumber _id");
    res.json(enquiries);
  } catch (err) {
    console.error("enquiry list error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/enquiry/:id
// Admin delete
router.delete("/:id", protect, requireRole("admin"), async (req, res) => {
  try {
    const e = await Enquiry.findById(req.params.id);
    if (!e) return res.status(404).json({ message: "Not found" });
    await e.deleteOne();
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("enquiry delete error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
