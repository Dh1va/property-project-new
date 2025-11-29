// server/routes/generalEnquiryRoutes.js
import express from "express";
import nodemailer from "nodemailer";
import Enquiry from "../models/Enquiry.js";

const router = express.Router();

// Helper for general enquiries
const generateRefNumber = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `GEN-${year}-${random}`;
};

// POST /api/enquiry/general
router.post("/", async (req, res) => {
  try {
    const { name, email, wish, meeting, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    const refNumber = generateRefNumber();

    await Enquiry.create({
      refNumber,
      propertyTitle: "General Enquiry",
      name,
      email,
      phone: wish || "",
      message: `${message}\n\nMeeting Preference: ${meeting || "N/A"}`,
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
    });

    const adminMail = {
      from: process.env.MAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `New General Enquiry - Ref: ${refNumber}`,
      html: `
        <h2>General Enquiry</h2>
        <p><b>Reference:</b> ${refNumber}</p>
        <hr/>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Wish:</b> ${wish}</p>
        <p><b>Meeting Preference:</b> ${meeting}</p>
        <p><b>Message:</b> ${message}</p>
      `,
    };

    const userMail = {
      from: process.env.MAIL_USER,
      to: email,
      subject: "We Received Your Enquiry",
      html: `
        <h2>Hello ${name},</h2>
        <p>Your general enquiry was received successfully.</p>
        <p>Your reference number:</p>
        <h3>${refNumber}</h3>
      `,
    };

    await transporter.sendMail(adminMail);
    await transporter.sendMail(userMail);

    res.json({ success: true, refNumber });
  } catch (err) {
    console.error("General enquiry error:", err);
    res.status(500).json({ success: false, message: "Failed to send enquiry" });
  }
});

export default router;
