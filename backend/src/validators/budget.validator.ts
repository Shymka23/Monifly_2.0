import Joi from "joi";

export class BudgetValidator {
  static create = Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
      "string.min": "Name must be at least 2 characters long",
      "string.max": "Name must not exceed 100 characters",
      "any.required": "Name is required",
    }),
    type: Joi.string().valid("income", "expense").required().messages({
      "any.only": "Type must be either income or expense",
      "any.required": "Type is required",
    }),
    category: Joi.string().min(2).max(50).required().messages({
      "string.min": "Category must be at least 2 characters long",
      "string.max": "Category must not exceed 50 characters",
      "any.required": "Category is required",
    }),
    limit: Joi.number().min(0).optional().allow(null),
    period: Joi.string()
      .valid("daily", "weekly", "monthly", "yearly")
      .default("monthly")
      .messages({
        "any.only": "Period must be one of: daily, weekly, monthly, yearly",
      }),
    color: Joi.string().optional(),
    icon: Joi.string().optional(),
  });

  static update = Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    type: Joi.string().valid("income", "expense").optional(),
    category: Joi.string().min(2).max(50).optional(),
    limit: Joi.number().min(0).optional().allow(null),
    period: Joi.string()
      .valid("daily", "weekly", "monthly", "yearly")
      .optional(),
    color: Joi.string().optional(),
    icon: Joi.string().optional(),
    spent: Joi.number().min(0).optional(),
  });

  static updateSpent = Joi.object({
    amount: Joi.number().min(0).required().messages({
      "number.base": "Amount must be a number",
      "number.min": "Amount cannot be negative",
      "any.required": "Amount is required",
    }),
  });

  static resetPeriod = Joi.object({
    period: Joi.string()
      .valid("daily", "weekly", "monthly", "yearly")
      .default("monthly"),
  });
}
