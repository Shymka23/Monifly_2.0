import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
  validate,
  validateParams,
  validateQuery,
} from "../middleware/validation.middleware";
import { TransactionController } from "../controllers/transaction.controller";
import {
  createTransactionSchema,
  updateTransactionSchema,
  transactionQuerySchema,
} from "../validators/transaction.validator";
import { idParamSchema } from "../validators/wallet.validator";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get transaction statistics
router.get("/stats", TransactionController.getStats);

// Get all transactions
router.get(
  "/",
  validateQuery(transactionQuerySchema),
  TransactionController.getAll
);

// Get single transaction
router.get("/:id", validateParams(idParamSchema), TransactionController.getOne);

// Create transaction
router.post(
  "/",
  validate(createTransactionSchema),
  TransactionController.create
);

// Update transaction
router.put(
  "/:id",
  validateParams(idParamSchema),
  validate(updateTransactionSchema),
  TransactionController.update
);

// Delete transaction
router.delete(
  "/:id",
  validateParams(idParamSchema),
  TransactionController.delete
);

export default router;
