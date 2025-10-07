import Joi from "joi";

export const buyCryptoSchema = Joi.object({
  symbol: Joi.string().min(2).max(10).uppercase().required().messages({
    "string.min": "Symbol must be at least 2 characters",
    "string.max": "Symbol must not exceed 10 characters",
    "any.required": "Symbol is required",
  }),
  amount: Joi.number().positive().required().messages({
    "number.positive": "Amount must be positive",
    "any.required": "Amount is required",
  }),
  purchasePrice: Joi.number().positive().optional(),
  currency: Joi.string().length(3).uppercase().optional(),
  walletAddress: Joi.string().max(200).optional(),
  notes: Joi.string().max(1000).optional(),
});

export const sellCryptoSchema = Joi.object({
  amount: Joi.number().positive().required().messages({
    "number.positive": "Amount must be positive",
    "any.required": "Amount is required",
  }),
  sellPrice: Joi.number().positive().required().messages({
    "number.positive": "Sell price must be positive",
    "any.required": "Sell price is required",
  }),
});

export const updateCryptoSchema = Joi.object({
  walletAddress: Joi.string().max(200).optional(),
  notes: Joi.string().max(1000).optional(),
});

export const pricesQuerySchema = Joi.object({
  symbols: Joi.string().optional(),
});

export const topCryptosQuerySchema = Joi.object({
  limit: Joi.number().min(1).max(100).optional(),
});
