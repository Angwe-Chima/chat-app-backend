import jwt from "jsonwebtoken";

const generateTokenAndSetCookie = (userID, res) => {
  const token = jwt.sign({ userID }, process.env.JWT_SECRET, {
    expiresIn: "14d",
  });

  res.cookie("token", token, {
    maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV != "development", // Secure in production
  });
};

export default generateTokenAndSetCookie;
