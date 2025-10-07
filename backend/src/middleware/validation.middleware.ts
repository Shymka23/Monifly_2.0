import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { ResponseUtil } from "../utils/response";

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      ResponseUtil.badRequest(res, "Validation error", errors);
      return;
    }

    // Replace request body with validated value
    req.body = value;
    next();
  };
};

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      ResponseUtil.badRequest(res, "Validation error", errors);
      return;
    }

    req.query = value;
    next();
  };
};

export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      ResponseUtil.badRequest(res, "Validation error", errors);
      return;
    }

    req.params = value;
    next();
  };
};
