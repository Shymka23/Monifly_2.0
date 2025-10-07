import Joi from "joi";

export class UserValidator {
  static updateProfile = Joi.object({
    name: Joi.string().min(2).max(100).optional().messages({
      "string.min": "Name must be at least 2 characters long",
      "string.max": "Name must not exceed 100 characters",
    }),
    avatar: Joi.string().uri().optional().allow(null),
    currency: Joi.string().length(3).uppercase().optional(),
    language: Joi.string().valid("uk", "ru", "en", "de", "es", "fr").optional(),
  });

  static updateSettings = Joi.object({
    currentAge: Joi.number().integer().min(0).max(150).optional(),
    targetAge: Joi.number().integer().min(0).max(150).optional(),
    retirementAge: Joi.number().integer().min(0).max(150).optional(),
    browserNotifications: Joi.boolean().optional(),
    emailNotifications: Joi.boolean().optional(),
    notificationFrequency: Joi.string()
      .valid("daily", "weekly", "monthly")
      .optional(),
    theme: Joi.string().valid("light", "dark", "system").optional(),
    primaryCurrency: Joi.string().length(3).uppercase().optional(),
  });

  static changePassword = Joi.object({
    currentPassword: Joi.string().min(6).required().messages({
      "string.min": "Current password must be at least 6 characters",
      "any.required": "Current password is required",
    }),
    newPassword: Joi.string().min(6).max(100).required().messages({
      "string.min": "New password must be at least 6 characters",
      "string.max": "New password must not exceed 100 characters",
      "any.required": "New password is required",
    }),
  });

  static deleteAccount = Joi.object({
    password: Joi.string().min(6).required().messages({
      "string.min": "Password must be at least 6 characters",
      "any.required": "Password is required for account deletion",
    }),
  });
}
