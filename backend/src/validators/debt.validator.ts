import Joi from "joi";

export const createDebtSchema = Joi.object({
  type: Joi.string()
    .valid("loan", "credit", "mortgage", "personal")
    .required()
    .messages({
      "any.only": "Type must be one of: loan, credit, mortgage, personal",
      "any.required": "Type is required",
    }),
  title: Joi.string().min(2).max(200).required().messages({
    "string.min": "Title must be at least 2 characters long",
    "string.max": "Title must not exceed 200 characters",
    "any.required": "Title is required",
  }),
  personName: Joi.string().max(100).optional(),
  initialAmount: Joi.number().positive().required().messages({
    "number.positive": "Initial amount must be positive",
    "any.required": "Initial amount is required",
  }),
  currency: Joi.string().length(3).uppercase().optional(),
  interestRate: Joi.number().min(0).max(100).optional(),
  startDate: Joi.date().iso().required().messages({
    "any.required": "Start date is required",
  }),
  dueDate: Joi.date().iso().greater(Joi.ref("startDate")).optional(),
  nextDueDate: Joi.date().iso().optional(),
  description: Joi.string().max(1000).optional(),
});

export const updateDebtSchema = Joi.object({
  type: Joi.string().valid("loan", "credit", "mortgage", "personal").optional(),
  title: Joi.string().min(2).max(200).optional(),
  personName: Joi.string().max(100).optional(),
  interestRate: Joi.number().min(0).max(100).optional(),
  dueDate: Joi.date().iso().optional(),
  nextDueDate: Joi.date().iso().optional(),
  description: Joi.string().max(1000).optional(),
  status: Joi.string().valid("active", "paid", "overdue").optional(),
});

export const addPaymentSchema = Joi.object({
  amount: Joi.number().positive().required().messages({
    "number.positive": "Amount must be positive",
    "any.required": "Amount is required",
  }),
  currency: Joi.string().length(3).uppercase().optional(),
  date: Joi.date().iso().optional(),
  description: Joi.string().max(500).optional(),
});
