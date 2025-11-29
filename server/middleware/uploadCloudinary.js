// middleware/uploadCloudinary.js
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "realestate_properties",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1600, crop: "limit" }],
  },
});

const upload = multer({ storage });

export default upload;
