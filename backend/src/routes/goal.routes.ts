import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { validate, validateParams } from "../middleware/validation.middleware";
import { GoalController } from "../controllers/goal.controller";
import {
  createGoalSchema,
  updateGoalSchema,
  contributionSchema,
} from "../validators/goal.validator";
import { idParamSchema } from "../validators/wallet.validator";

const router = Router();

router.use(authenticate);

// Get goal statistics
router.get("/stats", GoalController.getStats);

// Get all goals
router.get("/", GoalController.getAll);

// Get single goal
router.get("/:id", validateParams(idParamSchema), GoalController.getOne);

// Create goal
router.post("/", validate(createGoalSchema), GoalController.create);

// Update goal
router.put(
  "/:id",
  validateParams(idParamSchema),
  validate(updateGoalSchema),
  GoalController.update
);

// Delete goal
router.delete("/:id", validateParams(idParamSchema), GoalController.delete);

// Add contribution
router.post(
  "/:id/contribute",
  validateParams(idParamSchema),
  validate(contributionSchema),
  GoalController.addContribution
);

export default router;
