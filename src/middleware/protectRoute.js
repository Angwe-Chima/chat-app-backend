import jwt from 'jsonwebtoken';
import User from "../models/user.model.js"; 

const protectRoute = async (req, res, next) => {
  try {
    // Try to get token from cookies (standard approach)
    let token = req.cookies.token;

    // Fallback: try Authorization header if cookie not found
    if (!token && req.headers.authorization) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ 
        error: "Unauthorized - No token provided" 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ 
        error: "Unauthorized - Invalid token" 
      });
    }

    const user = await User.findById(decoded.userID).select("-password");

    if (!user) {
      return res.status(404).json({ 
        error: "User not found" 
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.log("Error in protect route middleware: " + err.message);
    res.status(401).json({ 
      error: "Unauthorized - " + err.message 
    });
  }
};

export default protectRoute;