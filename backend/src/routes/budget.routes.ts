import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { BudgetController } from "../controllers/budget.controller";
import { validate } from "../middleware/validation.middleware";
import { BudgetValidator } from "../validators/budget.validator";

const router = Router();

router.use(authenticate);

// Budget categories routes
router.get("/", BudgetController.getAll);
router.get("/overview", BudgetController.getOverview);
router.get("/:id", BudgetController.getOne);
router.post("/", validate(BudgetValidator.create), BudgetController.create);
router.put("/:id", validate(BudgetValidator.update), BudgetController.update);
router.delete("/:id", BudgetController.delete);
router.patch("/:id/spent", BudgetController.updateSpent);
router.post("/reset-period", BudgetController.resetPeriod);

export default router;
