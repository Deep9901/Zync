// Import Mongoose models for User and Message
import User from "../models/user.model.js";
import Message from "../models/message.model.js";

// Import Cloudinary for image uploads
import cloudinary from "../lib/cloudinary.js";
// Import Socket.IO utility functions
import { getReceiverSocketId, io } from "../lib/socket.js";


// Controller to get users for the sidebar (excluding the logged-in user).

export const getUsersForSidebar = async (req, res) => {
    try {
        // Get the ID of the currently logged-in user from the request
        const loggedInUserId = req.user._id;

        // Find all users except the logged-in user and exclude their password field
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

        // Send the filtered users as a JSON response with a 200 status
        res.status(200).json(filteredUsers);
    } catch (error) {
        // Log any errors that occur
        console.error("Error in getUsersForSidebar: ", error.message);
        // Send a 500 status with an internal server error message
        res.status(500).json({ error: "Internal server error" });
    }
};

// Controller to get messages between two users.

export const getMessages = async (req, res) => {
    try {
        // Extract the ID of the user to chat with from request parameters
        const { id: userToChatId } = req.params;
        // Get the ID of the currently logged-in user
        const myId = req.user._id;

        // Find messages where sender and receiver IDs match either way
        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId },
            ],
        });

        // Send the messages as a JSON response with a 200 status
        res.status(200).json(messages);
    } catch (error) {
        // Log any errors that occur
        console.log("Error in getMessages controller: ", error.message);
        // Send a 500 status with an internal server error message
        res.status(500).json({ error: "Internal server error" });
    }
};


//   Controller to send a new message.
//   Handles text and image messages, including Cloudinary upload for images.

export const sendMessages = async (req, res) => {
    try {
        // Extract text and image from the request body
        const { text, image } = req.body;
        // Extract the receiver's ID from request parameters
        const { id: receiverId } = req.params;
        // Get the sender's ID from the logged-in user
        const senderId = req.user._id;

        let imageUrl;
        // If an image is provided, upload it to Cloudinary
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url; // Get the secure URL of the uploaded image
        }

        // Create a new message instance
        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl, // Store the image URL if available
        });

        // Save the new message to the database
        await newMessage.save();

        // Get the socket ID of the receiver
        const receiverSocketId = getReceiverSocketId(receiverId);
        // If the receiver is online, emit a 'newMessage' event to them
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        // Send the new message as a JSON response with a 201 status (Created)
        res.status(201).json(newMessage);
    } catch (error) {
        // Log any errors that occur
        console.log("Error in sendMessage controller: ", error.message);
        // Send a 500 status with an internal server error message
        res.status(500).json({ error: "Internal server error" });
    }
};
