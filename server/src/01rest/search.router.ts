import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { searchService } from "../02service/search.service.js";
import { validateQuery } from "./middleware/validate.js";

const router = Router();

router.get(
  "/suggest",
  validateQuery,
  async (req: Request, res: Response, next: NextFunction) => {
    const q = (req.query.q as string).trim();

    try {
      const result = await searchService.getSuggestions(q);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/search",
  validateQuery,
  async (req: Request, res: Response, next: NextFunction) => {
    const q = (req.query.q as string).trim();
    const page = Math.max(1, parseInt((req.query.page as string) ?? "1", 10));

    try {
      const result = await searchService.doSearch(q, page);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
