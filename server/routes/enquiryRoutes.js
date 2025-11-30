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

// ✅ Create transporter ONCE
let transporter = null;
if (process.env.MAIL_USER && process.env.MAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });
}

// ✅ Background email sender — includes FULL message
const sendEnquiryEmails = async ({
  name,
  email,
  phone,
  message,
  refNumber,
  finalPropertyTitle,
  finalPropertyRef,
}) => {
  if (!transporter || !process.env.ADMIN_EMAIL) return;

  // Admin email
  const adminMail = {
    from: process.env.MAIL_USER,
    to: process.env.ADMIN_EMAIL,
    subject: `New Enquiry - ${finalPropertyTitle || "General"}`,
    html: `
      <h3>New Enquiry Received</h3>
      <p><b>Ref Number:</b> ${refNumber}</p>
      ${
        finalPropertyRef
          ? `<p><b>Property Ref:</b> ${finalPropertyRef}</p>`
          : ""
      }
      <p><b>Property:</b> ${finalPropertyTitle || "General"}</p>

      <hr/>
      <p><b>Name:</b> ${name}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Phone:</b> ${phone || "N/A"}</p>

      <p style="margin-top:10px;"><b>Message:</b><br/>${message}</p>
    `,
  };

  // User confirmation email (includes message)
  const userMail = {
    from: process.env.MAIL_USER,
    to: email,
    subject: "We received your enquiry",
    html: `
      <h3>Hello ${name},</h3>
      <p>Thank you for contacting us. Your enquiry has been received.</p>

      <p><b>Reference:</b> ${refNumber}</p>
      ${
        finalPropertyRef
          ? `<p><b>Property:</b> ${finalPropertyRef}</p>`
          : ""
      }

      <hr/>
      <p><b>Your Message:</b><br/>${message}</p>

      <hr/>
      <p style="font-size:12px;color:#777;">This is an automated confirmation email.</p>
    `,
  };

  try {
    await transporter.sendMail(adminMail);
  } catch (err) {
    console.error("Failed to send admin enquiry email:", err);
  }

  try {
    await transporter.sendMail(userMail);
  } catch (err) {
    console.error("Failed to send user enquiry email:", err);
  }
};

// POST /api/enquiry
router.post("/", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      message,
      propertyTitle,
      propertyRef,
      propertyId,
    } = req.body;

    if (!name || !email || !message) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // Resolve property details
    let propertyDoc = null;
    let finalPropertyTitle = propertyTitle;
    let finalPropertyRef = propertyRef;

    if (propertyId) {
      try {
        propertyDoc = await Property.findById(propertyId).select(
          "title refNumber"
        );
      } catch (err) {
        console.error("Property lookup error:", err);
      }
    }

    if (propertyDoc) {
      if (!finalPropertyTitle) finalPropertyTitle = propertyDoc.title;
      if (!finalPropertyRef) finalPropertyRef = propertyDoc.refNumber;
    }

    const isPropertyEnquiry = !!(propertyDoc || propertyTitle || propertyRef);
    const refNumber = genRef(isPropertyEnquiry ? "PROP" : "GEN");

    // Save enquiry
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

    // ✅ Respond immediately (FAST)
    res.status(201).json({ success: true, refNumber });

    // ✅ Send emails AFTER response
    sendEnquiryEmails({
      name,
      email,
      phone,
      message,
      refNumber,
      finalPropertyTitle,
      finalPropertyRef,
    }).catch((err) =>
      console.error("Background email error:", err)
    );
  } catch (err) {
    console.error("Enquiry create error:", err);
    if (!res.headersSent) {
      res
        .status(500)
        .json({ success: false, message: "Failed to create enquiry" });
    }
  }
});

// Admin list enquiries
router.get("/", protect, requireRole("admin"), async (req, res) => {
  try {
    const enquiries = await Enquiry.find()
      .sort({ createdAt: -1 })
      .populate("property", "title refNumber _id");

    res.json(enquiries);
  } catch (err) {
    console.error("Enquiry list error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Admin delete enquiry
router.delete("/:id", protect, requireRole("admin"), async (req, res) => {
  try {
    const e = await Enquiry.findById(req.params.id);
    if (!e) return res.status(404).json({ message: "Not found" });

    await e.deleteOne();
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("Enquiry delete error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
