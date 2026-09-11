import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    // Decode token directly - Zero DB calls required
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      ...decoded,
      _id: decoded._id || decoded.id,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Token failed or expired" });
  }
};
// user request send karega toh teen gate honge. Pahle gate pe ye check hoga ki user logged in hai. Agar logged in hai toh verified hai ya nhi.
