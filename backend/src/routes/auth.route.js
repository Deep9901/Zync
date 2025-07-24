import express from "express"; // Import the express library to create a router
import { signup, login, logout, updateProfile, checkAuth } from "../controllers/auth.controller.js"; // Import controller functions for authentication
import { protectRoute } from "../middleware/auth.middleware.js" // Import middleware to protect routes

const router = express.Router(); // Create a new router instance

// Define authentication routes

// Route for user signup
router.post("/signup", signup);
// Route for user login
router.post("/login", login);
// Route for user logout
router.post("/logout", logout);

// Route to update user profile, protected by authentication middleware
router.put("/update-profile", protectRoute, updateProfile);

// Route to check authentication status, protected by authentication middleware
router.get("/check", protectRoute, checkAuth);

export default router; // Export the router for use in other parts of the application
