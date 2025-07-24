// Import necessary modules for Socket.IO server
import { Server } from "socket.io";
import http from "http";
import express from "express";

// Initialize Express app and create an HTTP server
const app = express();
const server = http.createServer(app);

// Configure Socket.IO server
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"], // Allow connections from this origin
    },
});

// Function to get receiver's socket ID
export function getReceiverSocketId(userId) {
    return userSocketMap[userId];
}

// Store online users: {userId: socketId}
const userSocketMap = {};

// Handle Socket.IO connections
io.on("connection", (socket) => {
    console.log("A user connected", socket.id);

    // Get userId from handshake query and store it
    const userId = socket.handshake.query.userId;
    if (userId) userSocketMap[userId] = socket.id;

    // Emit online users to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // Handle user disconnection
    socket.on("disconnect", () => {
        console.log("A user disconnected", socket.id);
        delete userSocketMap[userId]; // Remove disconnected user
        io.emit("getOnlineUsers", Object.keys(userSocketMap)); // Update online users list
    });
});

// Export Socket.IO instance, Express app, and HTTP server
export { io, app, server };
