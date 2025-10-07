import Joi from "joi";

export const createCaseSchema = Joi.object({
  name: Joi.string().min(2).max(200).required().messages({
    "string.min": "Name must be at least 2 characters long",
    "string.max": "Name must not exceed 200 characters",
    "any.required": "Name is required",
  }),
  title: Joi.string().min(2).max(200).required().messages({
    "string.min": "Title must be at least 2 characters long",
    "string.max": "Title must not exceed 200 characters",
    "any.required": "Title is required",
  }),
  description: Joi.string().max(1000).optional(),
  totalInvestment: Joi.number().min(0).optional(),
  currency: Joi.string().length(3).uppercase().optional(),
  strategy: Joi.string()
    .valid("aggressive", "moderate", "conservative")
    .optional(),
  riskLevel: Joi.string().valid("low", "medium", "high").optional(),
});

export const updateCaseSchema = Joi.object({
  name: Joi.string().min(2).max(200).optional(),
  title: Joi.string().min(2).max(200).optional(),
  description: Joi.string().max(1000).optional(),
  strategy: Joi.string()
    .valid("aggressive", "moderate", "conservative")
    .optional(),
  riskLevel: Joi.string().valid("low", "medium", "high").optional(),
});

export const addAssetSchema = Joi.object({
  name: Joi.string().min(2).max(200).required().messages({
    "string.min": "Name must be at least 2 characters long",
    "string.max": "Name must not exceed 200 characters",
    "any.required": "Name is required",
  }),
  type: Joi.string()
    .valid("stocks", "bonds", "etf", "real_estate", "crypto")
    .required()
    .messages({
      "any.only":
        "Type must be one of: stocks, bonds, etf, real_estate, crypto",
      "any.required": "Type is required",
    }),
  quantity: Joi.number().positive().required().messages({
    "number.positive": "Quantity must be positive",
    "any.required": "Quantity is required",
  }),
  purchasePrice: Joi.number().positive().required().messages({
    "number.positive": "Purchase price must be positive",
    "any.required": "Purchase price is required",
  }),
  currency: Joi.string().length(3).uppercase().optional(),
  ticker: Joi.string().max(10).optional(),
  region: Joi.string().valid("us", "europe", "asia", "other").optional(),
  sector: Joi.string().max(100).optional(),
});

export const updateAssetSchema = Joi.object({
  currentPrice: Joi.number().positive().optional(),
  quantity: Joi.number().positive().optional(),
});
