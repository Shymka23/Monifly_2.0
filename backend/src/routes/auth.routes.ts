import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";
import { authRateLimiter } from "../middleware/rate-limiter.middleware";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
} from "../validators/auth.validator";

const router = Router();

// Public routes
router.post(
  "/register",
  authRateLimiter,
  validate(registerSchema),
  AuthController.register
);

router.post(
  "/login",
  authRateLimiter,
  validate(loginSchema),
  AuthController.login
);

router.post(
  "/refresh",
  validate(refreshTokenSchema),
  AuthController.refreshToken
);

// Protected routes
router.post("/logout", authenticate, AuthController.logout);
router.get("/me", authenticate, AuthController.me);
router.put(
  "/change-password",
  authenticate,
  validate(changePasswordSchema),
  AuthController.changePassword
);

export default router;
