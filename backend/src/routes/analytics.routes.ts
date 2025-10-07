import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { AnalyticsController } from "../controllers/analytics.controller";

const router = Router();

router.use(authenticate);

// Get overview analytics
router.get("/overview", AnalyticsController.getOverview);

// Get income/expense analytics
router.get("/income-expense", AnalyticsController.getIncomeExpense);

// Get net worth over time
router.get("/net-worth", AnalyticsController.getNetWorth);

// Get spending by category
router.get("/spending-by-category", AnalyticsController.getSpendingByCategory);

// Get budget vs actual
router.get("/budget-vs-actual", AnalyticsController.getBudgetVsActual);

export default router;
