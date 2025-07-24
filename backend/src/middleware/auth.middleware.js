import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import dotenv from "dotenv";
dotenv.config();

export const protectRoute = async (req, res, next) => {
    try {
        // 1. Get token from cookies
        const token = req.cookies.jwt;

        if (!token) {
            return res.status(401).json({
                message: "Unauthorized - No Token Provided"
            });
        }

        // 2. Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Find user and exclude password
        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 4. Attach user to request object
        req.user = user;

        // 5. Continue to the next middleware or route
        next();
    } catch (err) {
        console.error("Error in protectRoute middleware:", err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
