import jwt from "jsonwebtoken";
import Seller from "../models/Seller.js";
import Admin from "../models/Admin.js"; // only if admins are separate users

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // decoded should contain { id, role }
      req.user = {
        id: decoded.id,
        role: decoded.role,
      };

      return next();
    } catch (err) {
      console.error(err);
      return res.status(401).json({ message: "Not authorized, invalid token" });
    }
  }

  return res.status(401).json({ message: "Not authorized, no token" });
};

// 🔥 add this — required by your admin routes
export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  next();
};
