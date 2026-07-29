import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protect = async (req, res, next) => {
  let token;
  console.log("HEADERS:", req.headers.authorization);
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    console.log("USER.username =", user.username);
console.log("USER.username =", user.username);
console.log("USER.toObject() =", user.toObject());
    req.user = user;
    console.log("USER OBJECT:", user);
    console.log("REQ.USER.username =", req.user.username);
console.log("REQ.USER.username =", req.user.username);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: "Token invalid" });
  }
};

// user request send karega toh teen gate honge. Pahle gate pe ye check hoga ki user logged in hai. Agar logged in hai toh verified hai ya nhi.
