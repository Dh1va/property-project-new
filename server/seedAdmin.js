// seedAdmin.js
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import Admin from "./models/Admin.js";
dotenv.config();
connectDB();

const seed = async () => {
  try {
    const count = await Admin.countDocuments();
    if (count === 0) {
      const admin = new Admin({ username: "admin", password: "password" });
      await admin.save();
      console.log("Seeded admin: username=admin password=password");
    } else {
      console.log("Admin already exists.");
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
