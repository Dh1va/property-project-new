// utils/generateToken.js
import jwt from "jsonwebtoken";
export default function generateToken(id, role = "seller") {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "1d" });
}
