import { Router } from "express";
import { enhanceLoanController } from "../controllers/loan.controller";

const router = Router();

// POST /api/enhance-loan - Takes loan data JSON and returns AI-enhanced data
router.post("/enhance-loan", enhanceLoanController);

export const loanRoutes = router;
