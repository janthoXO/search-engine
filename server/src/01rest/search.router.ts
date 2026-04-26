import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { searchService } from "../02service/search.service.js";
import { validateQuery } from "./middleware/validate.js";

import { embeddingQueue } from "../02service/embeddingQueue.service.js";
import { recommendationService } from "@/02service/recommendation.service.js";

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
      const sessionId =
        (res.locals.sessionId as string | undefined) ||
        (req.query.sessionId as string | undefined);

      if (sessionId) {
        embeddingQueue.enqueue(sessionId, q);
      }

      const result = await searchService.doSearch(q, page);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/recommend",
  async (req: Request, res: Response, next: NextFunction) => {
    // Read sessionId from res.locals if set by session middleware,
    // or from a query parameter for dev purposes
    const sessionId =
      (res.locals.sessionId as string | undefined) ||
      (req.query.sessionId as string | undefined);

    if (!sessionId) {
      res
        .status(400)
        .json({ error: "Session ID is required for recommendations" });
      return;
    }

    try {
      const result = await recommendationService.recommend(sessionId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
