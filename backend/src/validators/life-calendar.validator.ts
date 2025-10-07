import Joi from "joi";

export class LifeCalendarValidator {
  static upsert = Joi.object({
    year: Joi.number().integer().min(1900).max(2200).required().messages({
      "number.base": "Year must be a number",
      "number.integer": "Year must be an integer",
      "number.min": "Year must be between 1900 and 2200",
      "number.max": "Year must be between 1900 and 2200",
      "any.required": "Year is required",
    }),
    age: Joi.number().integer().min(0).max(150).optional().allow(null),
    income: Joi.number().min(0).optional().allow(null),
    expenses: Joi.number().min(0).optional().allow(null),
    savings: Joi.number().optional().allow(null),
    netWorth: Joi.number().optional().allow(null),
    events: Joi.array().items(Joi.string()).optional().default([]),
    notes: Joi.string().max(1000).optional().allow(null),
    mood: Joi.string()
      .valid("great", "good", "neutral", "bad")
      .optional()
      .allow(null),
  });

  static createMilestone = Joi.object({
    title: Joi.string().min(2).max(200).required().messages({
      "string.min": "Title must be at least 2 characters long",
      "string.max": "Title must not exceed 200 characters",
      "any.required": "Title is required",
    }),
    description: Joi.string().max(1000).optional().allow(null),
    type: Joi.string()
      .valid("financial", "personal", "career", "health", "education")
      .required()
      .messages({
        "any.only":
          "Type must be one of: financial, personal, career, health, education",
        "any.required": "Type is required",
      }),
    targetDate: Joi.date().iso().required().messages({
      "date.base": "Target date must be a valid date",
      "any.required": "Target date is required",
    }),
    targetAmount: Joi.number().min(0).optional().allow(null),
    currentAmount: Joi.number().min(0).optional().allow(null).default(0),
    priority: Joi.number().integer().min(0).max(10).optional().default(0),
  });

  static updateMilestone = Joi.object({
    title: Joi.string().min(2).max(200).optional(),
    description: Joi.string().max(1000).optional().allow(null),
    type: Joi.string()
      .valid("financial", "personal", "career", "health", "education")
      .optional(),
    targetDate: Joi.date().iso().optional(),
    targetAmount: Joi.number().min(0).optional().allow(null),
    currentAmount: Joi.number().min(0).optional().allow(null),
    status: Joi.string()
      .valid("pending", "in_progress", "completed", "cancelled")
      .optional(),
    priority: Joi.number().integer().min(0).max(10).optional(),
  });
}
