import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();

import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";

const app = express();

app.use(cors());

// body parser
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// cookie parser
app.use(cookieParser());

app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;

app.use((req, res, next) => {
  console.log("Response Headers:", res.getHeaders());
  next();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  connectDB();
});
