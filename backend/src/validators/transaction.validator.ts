import Joi from "joi";

export const createTransactionSchema = Joi.object({
  walletId: Joi.string().uuid().required().messages({
    "string.guid": "Invalid wallet ID format",
    "any.required": "Wallet ID is required",
  }),
  type: Joi.string()
    .valid("income", "expense", "transfer")
    .required()
    .messages({
      "any.only": "Type must be one of: income, expense, transfer",
      "any.required": "Type is required",
    }),
  category: Joi.string().required().messages({
    "any.required": "Category is required",
  }),
  amount: Joi.number().positive().required().messages({
    "number.positive": "Amount must be positive",
    "any.required": "Amount is required",
  }),
  currency: Joi.string().length(3).uppercase().optional(),
  description: Joi.string().max(500).optional(),
  date: Joi.date().iso().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  location: Joi.string().max(200).optional(),
});

export const updateTransactionSchema = Joi.object({
  type: Joi.string().valid("income", "expense", "transfer").optional(),
  category: Joi.string().optional(),
  amount: Joi.number().positive().optional(),
  description: Joi.string().max(500).optional(),
  date: Joi.date().iso().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  location: Joi.string().max(200).optional(),
});

export const transactionQuerySchema = Joi.object({
  page: Joi.number().min(1).optional(),
  limit: Joi.number().min(1).max(100).optional(),
  type: Joi.string().valid("income", "expense", "transfer").optional(),
  category: Joi.string().optional(),
  walletId: Joi.string().uuid().optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  minAmount: Joi.number().optional(),
  maxAmount: Joi.number().optional(),
});
