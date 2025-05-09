import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { getSupabase } from "./config/supabase";
import { validateEnv } from "./utils/validateEnv";

// Load environment variables
dotenv.config();

// Validate environment variables
validateEnv();

// Import routes
import authRoutes from "./routes/auth.routes";
import usersRoutes from "./routes/users.routes";

// Import middlewares
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", usersRoutes);

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Flowlet API is running" });
});

// Default route
app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to Flowlet API 0.0.1!" });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);

  // Test Supabase connection
  getSupabase()
    .auth.getSession()
    .then(() => console.log("Successfully connected to Supabase"))
    .catch((err) => console.error("Error connecting to Supabase:", err));
});
