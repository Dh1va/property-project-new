// server/routes/propertyEnquiryRoutes.js
import express from "express";
import nodemailer from "nodemailer";
import Enquiry from "../models/Enquiry.js";

const router = express.Router();

// Helper: Generate reference ID
const generateRefNumber = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `PROP-${year}-${random}`;
};

// POST /api/enquiry/property
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, message, propertyTitle, propertyRef } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    const refNumber = propertyRef || generateRefNumber();

    // Save to DB
    await Enquiry.create({
      refNumber,
      propertyTitle: propertyTitle || "",
      name,
      email,
      phone,
      message,
    });

    // Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
    });

    // Admin Email
    const adminMail = {
      from: process.env.MAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `New Property Inquiry - ${propertyTitle || "Unknown Property"}`,
      html: `
        <h2>New Property Inquiry</h2>
        <p><b>Reference:</b> ${refNumber}</p>
        <p><b>Property:</b> ${propertyTitle || "N/A"}</p>
        <hr/>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone || "N/A"}</p>
        <p><b>Message:</b> ${message}</p>
      `,
    };

    const userMail = {
      from: process.env.MAIL_USER,
      to: email,
      subject: "We Received Your Property Inquiry",
      html: `
        <h2>Hello ${name},</h2>
        <p>Thank you for contacting us regarding <b>${propertyTitle}</b>.</p>
        <p>Your inquiry reference number:</p>
        <h3>${refNumber}</h3>
        <p>We will get back to you soon.</p>
      `,
    };

    await transporter.sendMail(adminMail);
    await transporter.sendMail(userMail);

    res.json({ success: true, refNumber });
  } catch (err) {
    console.error("Property enquiry error:", err);
    res.status(500).json({ success: false, message: "Failed to send enquiry" });
  }
});

export default router;
