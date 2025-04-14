import { Response, Router } from "express";
import {
  AuthenticatedRequest,
  authMiddleware,
} from "../middlewares/auth.middleware";
import { Profile } from "../types/database.types";
import { getUserProfile, updateUserProfile } from "../services/user.service";
const router = Router();

// All routes are protected by authentication
router.use(authMiddleware);

// GET /api/users/profile - Get user profile
router.get("/profile", async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { data, error } = await getUserProfile(req.user.id);

    if (error) {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res.status(200).json({ profile: data });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({ message: "Server error fetching profile" });
  }
});

// PATCH /api/users/profile - Update user profile
router.patch("/profile", async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { name, avatar_url } = req.body;

    // Validate input
    if (!name && !avatar_url) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    const updateData: Partial<Profile> = {};
    if (name) updateData.name = name;
    if (avatar_url) updateData.avatar_url = avatar_url;

    const { data, error } = await updateUserProfile(req.user.id, updateData);

    if (error) {
      return res
        .status(400)
        .json({ message: "Error updating profile", error: error.message });
    }

    return res
      .status(200)
      .json({ message: "Profile updated successfully", profile: data });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ message: "Server error updating profile" });
  }
});

export default router;
