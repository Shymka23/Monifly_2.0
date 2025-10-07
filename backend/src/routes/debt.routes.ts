import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { validate, validateParams } from "../middleware/validation.middleware";
import { DebtController } from "../controllers/debt.controller";
import {
  createDebtSchema,
  updateDebtSchema,
  addPaymentSchema,
} from "../validators/debt.validator";
import { idParamSchema } from "../validators/wallet.validator";

const router = Router();

router.use(authenticate);

// Get debt statistics
router.get("/stats", DebtController.getStats);

// Get all debts
router.get("/", DebtController.getAll);

// Get single debt
router.get("/:id", validateParams(idParamSchema), DebtController.getOne);

// Get payment history
router.get(
  "/:id/payments",
  validateParams(idParamSchema),
  DebtController.getPayments
);

// Create debt
router.post("/", validate(createDebtSchema), DebtController.create);

// Update debt
router.put(
  "/:id",
  validateParams(idParamSchema),
  validate(updateDebtSchema),
  DebtController.update
);

// Delete debt
router.delete("/:id", validateParams(idParamSchema), DebtController.delete);

// Add payment
router.post(
  "/:id/payments",
  validateParams(idParamSchema),
  validate(addPaymentSchema),
  DebtController.addPayment
);

export default router;
