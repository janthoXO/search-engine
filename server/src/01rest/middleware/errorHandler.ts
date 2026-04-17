import type { Request, Response, NextFunction } from "express";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  console.error(err);

  // Don't leak internal error details to the client
  res.status(500).json({ error: "Internal server error" });
}
