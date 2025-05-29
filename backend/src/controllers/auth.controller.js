import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js"


export const signup = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        // Check if password lenght is less than 6
        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        // Check if the email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "Email already in use"
            });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user
        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
        });

        if (newUser) {
            // generate a JWT token
            generateToken(newUser._id, res);
            await newUser.save();
            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic,
            });

        } else {
            res.status(400).json({
                message: "Invalid user data"
            });
        }
    } catch (err) {
        console.erro("Error in signup controller", err.message);
        res.status(500).json({
            message: "Internal Server Error",
        });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).jsom({
                message: "Inavalid credentials"
            })
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).jsom({
                message: "Inavalid credentials"
            })
        }

        generateToken(user._id, res);

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
        });
    } catch (err) {
        console.error("Error in login controller", err.message);
        res.status(500).json({
            message: "Internal Server Error",
        });
    }
}

export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({
            message: "Logged out successfully"
        });
    } catch (err) {
        console.error("Error in logout controller", err.message);
        res.status(500).json({
            message: "Internal Server Error",
        });
    }
}

export const updateProfile = async (req, res) => {
    try {
        const { profilePic } = req.body;
        const userId = req.user._id;

        if (!profilePic) {
            res.status(400).json({
                message: "Profile pic is required"
            });
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        const updatedUser = await User.findByIdAndUpdate(userId, {
            profilePic: uploadResponse.secure_url
        }, { new: true });

        res.status(200).json(updatedUser);

    } catch (err) {
        console.error("Error in update profile", err.message);
        res.status(500).json({
            message: "Internal server error"
        });
    }
}

export const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (err) {
        console.error("Error in checkAuth controller", err.message);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
}