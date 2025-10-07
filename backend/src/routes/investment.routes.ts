import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { validate, validateParams } from "../middleware/validation.middleware";
import { InvestmentController } from "../controllers/investment.controller";
import {
  createCaseSchema,
  updateCaseSchema,
  addAssetSchema,
  updateAssetSchema,
} from "../validators/investment.validator";
import { idParamSchema } from "../validators/wallet.validator";

const router = Router();

router.use(authenticate);

// Get investment statistics
router.get("/stats", InvestmentController.getStats);

// Get all investment cases
router.get("/", InvestmentController.getAll);

// Get single case
router.get("/:id", validateParams(idParamSchema), InvestmentController.getOne);

// Create case
router.post("/", validate(createCaseSchema), InvestmentController.create);

// Update case
router.put(
  "/:id",
  validateParams(idParamSchema),
  validate(updateCaseSchema),
  InvestmentController.update
);

// Delete case
router.delete(
  "/:id",
  validateParams(idParamSchema),
  InvestmentController.delete
);

// Add asset to case
router.post(
  "/:id/assets",
  validateParams(idParamSchema),
  validate(addAssetSchema),
  InvestmentController.addAsset
);

// Update asset
router.put(
  "/:id/assets/:assetId",
  validate(updateAssetSchema),
  InvestmentController.updateAsset
);

// Delete asset
router.delete("/:id/assets/:assetId", InvestmentController.deleteAsset);

export default router;
