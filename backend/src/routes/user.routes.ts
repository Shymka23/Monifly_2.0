import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { UserController } from "../controllers/user.controller";
import { validate } from "../middleware/validation.middleware";
import { UserValidator } from "../validators/user.validator";

const router = Router();

// All routes require authentication
router.use(authenticate);

// User profile routes
router.get("/profile", UserController.getProfile);
router.put(
  "/profile",
  validate(UserValidator.updateProfile),
  UserController.updateProfile
);

// User settings routes
router.get("/settings", UserController.getSettings);
router.put(
  "/settings",
  validate(UserValidator.updateSettings),
  UserController.updateSettings
);

// Password and account management
router.post(
  "/change-password",
  validate(UserValidator.changePassword),
  UserController.changePassword
);
router.delete(
  "/account",
  validate(UserValidator.deleteAccount),
  UserController.deleteAccount
);

// Statistics
router.get("/statistics", UserController.getStatistics);

export default router;
