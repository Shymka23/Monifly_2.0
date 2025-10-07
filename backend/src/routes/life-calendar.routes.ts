import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { LifeCalendarController } from "../controllers/life-calendar.controller";
import { validate } from "../middleware/validation.middleware";
import { LifeCalendarValidator } from "../validators/life-calendar.validator";

const router = Router();

router.use(authenticate);

// Life calendar routes
router.get("/", LifeCalendarController.getAll);
router.get("/overview", LifeCalendarController.getOverview);
router.get("/year/:year", LifeCalendarController.getByYear);
router.post(
  "/",
  validate(LifeCalendarValidator.upsert),
  LifeCalendarController.upsert
);
router.delete("/year/:year", LifeCalendarController.delete);
router.patch("/year/:year/complete", LifeCalendarController.markCompleted);

// Milestone routes
router.get("/year/:year/milestones", LifeCalendarController.getMilestones);
router.post(
  "/year/:year/milestones",
  validate(LifeCalendarValidator.createMilestone),
  LifeCalendarController.addMilestone
);
router.put(
  "/milestones/:milestoneId",
  validate(LifeCalendarValidator.updateMilestone),
  LifeCalendarController.updateMilestone
);
router.delete(
  "/milestones/:milestoneId",
  LifeCalendarController.deleteMilestone
);

export default router;
