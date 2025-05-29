import express from "express";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js"

import { connectDB } from "./lib/db.js";

import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
})
);

// routes
app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);

// server running
app.listen(port, () => { 
    console.log(`🚀 Server listening on port ${port}!`) 
    connectDB();
});