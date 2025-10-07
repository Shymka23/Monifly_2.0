import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { validate, validateParams } from "../middleware/validation.middleware";
import { WalletController } from "../controllers/wallet.controller";
import {
  createWalletSchema,
  updateWalletSchema,
  idParamSchema,
} from "../validators/wallet.validator";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all wallets
router.get("/", WalletController.getAll);

// Get total balance
router.get("/balance/total", WalletController.getTotalBalance);

// Get single wallet
router.get("/:id", validateParams(idParamSchema), WalletController.getOne);

// Get wallet balance
router.get(
  "/:id/balance",
  validateParams(idParamSchema),
  WalletController.getBalance
);

// Create wallet
router.post("/", validate(createWalletSchema), WalletController.create);

// Update wallet
router.put(
  "/:id",
  validateParams(idParamSchema),
  validate(updateWalletSchema),
  WalletController.update
);

// Delete wallet
router.delete("/:id", validateParams(idParamSchema), WalletController.delete);

export default router;
