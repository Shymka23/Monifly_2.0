import { Request, Response } from "express";
import { ResponseUtil } from "../utils/response";

export const notFound = (req: Request, res: Response) => {
  ResponseUtil.notFound(res, `Route ${req.originalUrl} not found`);
};
