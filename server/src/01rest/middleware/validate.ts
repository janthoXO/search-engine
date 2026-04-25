import type { Request, Response, NextFunction } from "express";

export function validateQuery(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const q = req.query.q;

  if (typeof q !== "string" || q.trim().length === 0) {
    res.status(400).json({
      error: "Query parameter 'q' is required and must be a non-empty string",
    });
    return;
  }

  if (q.length > 200) {
    res
      .status(400)
      .json({ error: "Query parameter 'q' must not exceed 200 characters" });
    return;
  }

  next();
}
