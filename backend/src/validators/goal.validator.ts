import Joi from "joi";

export const createGoalSchema = Joi.object({
  title: Joi.string().min(2).max(200).required().messages({
    "string.min": "Title must be at least 2 characters long",
    "string.max": "Title must not exceed 200 characters",
    "any.required": "Title is required",
  }),
  description: Joi.string().max(1000).optional(),
  type: Joi.string()
    .valid("saving", "investment", "purchase", "debt_payoff")
    .required()
    .messages({
      "any.only":
        "Type must be one of: saving, investment, purchase, debt_payoff",
      "any.required": "Type is required",
    }),
  targetAmount: Joi.number().positive().required().messages({
    "number.positive": "Target amount must be positive",
    "any.required": "Target amount is required",
  }),
  currentAmount: Joi.number().min(0).optional(),
  currency: Joi.string().length(3).uppercase().optional(),
  targetDate: Joi.date().iso().greater("now").required().messages({
    "date.greater": "Target date must be in the future",
    "any.required": "Target date is required",
  }),
  monthlyContribution: Joi.number().positive().optional(),
  priority: Joi.number().min(0).max(10).optional(),
  category: Joi.string().optional(),
  imageUrl: Joi.string().uri().optional(),
  isRecurring: Joi.boolean().optional(),
  reminderEnabled: Joi.boolean().optional(),
});

export const updateGoalSchema = Joi.object({
  title: Joi.string().min(2).max(200).optional(),
  description: Joi.string().max(1000).optional(),
  type: Joi.string()
    .valid("saving", "investment", "purchase", "debt_payoff")
    .optional(),
  targetAmount: Joi.number().positive().optional(),
  currentAmount: Joi.number().min(0).optional(),
  targetDate: Joi.date().iso().optional(),
  monthlyContribution: Joi.number().positive().optional(),
  priority: Joi.number().min(0).max(10).optional(),
  status: Joi.string()
    .valid("active", "completed", "paused", "cancelled")
    .optional(),
  category: Joi.string().optional(),
  imageUrl: Joi.string().uri().optional(),
  isRecurring: Joi.boolean().optional(),
  reminderEnabled: Joi.boolean().optional(),
});

export const contributionSchema = Joi.object({
  amount: Joi.number().positive().required().messages({
    "number.positive": "Amount must be positive",
    "any.required": "Amount is required",
  }),
});
