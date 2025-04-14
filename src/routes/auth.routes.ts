import { Request, Response, Router } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { createUser, login, resetPassword } from "../services/auth.service";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// Public routes
router.post("/register", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // Use service role to bypass RLS
    const { data: userData, error } = await createUser(email, password);

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    if (!userData || !userData.user) {
      return res.status(500).json({ message: "Failed to create user" });
    }

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: userData.user.id,
        email: userData.user.email,
        name: userData.user.user_metadata?.name,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res
      .status(500)
      .json({ message: "Server error during registration" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const { data, error } = await login(email, password);

    if (error) {
      return res.status(401).json({ message: error.message });
    }

    if (!data || !data.session || !data.user) {
      return res.status(401).json({ message: "Login failed" });
    }

    return res.status(200).json({
      message: "Login successful",
      session: data.session,
      user: data.user,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error during login" });
  }
});

router.post("/reset-password", async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const { error } = await resetPassword(email);

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("Password reset error:", error);
    return res
      .status(500)
      .json({ message: "Server error during password reset" });
  }
});

// Protected routes
router.get(
  "/me",
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      // User is already attached to request by auth middleware
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      return res.status(200).json({ user: req.user });
    } catch (error) {
      console.error("Get user error:", error);
      return res.status(500).json({
        message: "Server error fetching user data",
      });
    }
  },
);

export default router;
