import Joi from "joi";

export const createWalletSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    "string.min": "Name must be at least 2 characters long",
    "string.max": "Name must not exceed 100 characters",
    "any.required": "Name is required",
  }),
  type: Joi.string()
    .valid("cash", "bank", "card", "crypto", "investment")
    .required()
    .messages({
      "any.only": "Type must be one of: cash, bank, card, crypto, investment",
      "any.required": "Type is required",
    }),
  balance: Joi.number().min(0).optional(),
  currency: Joi.string().length(3).uppercase().optional(),
  color: Joi.string().optional(),
  icon: Joi.string().optional(),
});

export const updateWalletSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  type: Joi.string()
    .valid("cash", "bank", "card", "crypto", "investment")
    .optional(),
  color: Joi.string().optional(),
  icon: Joi.string().optional(),
  isDefault: Joi.boolean().optional(),
});

export const idParamSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    "string.guid": "Invalid ID format",
    "any.required": "ID is required",
  }),
});
