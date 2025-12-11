import jwt from "jsonwebtoken";

const generateTokenAndSetCookie = (userID, res) => {
  const token = jwt.sign({ userID }, process.env.JWT_SECRET, {
    expiresIn: "14d",
  });

  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("token", token, {
    maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
    httpOnly: true,
    // For cross-origin requests, sameSite must be "none" with secure: true
    // For same-origin, use "lax"
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction ? true : false, // HTTPS only in production
  });
};

export default generateTokenAndSetCookie;