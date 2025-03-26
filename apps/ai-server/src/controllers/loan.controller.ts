import { Request, Response } from 'express';
import { getLoanSummary } from '../templates/loan-summary.template';
import { getRiskAssessment } from '../templates/risk-assessment.template';
import { generateWithLLM } from '../utils/llm.util';

interface LoanData {
  borrowerName: string;
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  collateralType?: string;
  collateralValue?: number;
  borrowerCreditScore?: number;
  purpose?: string;
  [key: string]: any;
}

export const enhanceLoanController = async (req: Request, res: Response) => {
  try {
    const loanData: LoanData = req.body;

    // Validate the request
    if (!loanData || !loanData.borrowerName || !loanData.loanAmount) {
      return res.status(400).json({ 
        error: 'Invalid request. Required fields: borrowerName, loanAmount'
      });
    }

    // Get loan summary from LLM
    const summaryPrompt = getLoanSummary(loanData);
    const summaryResponse = await generateWithLLM(summaryPrompt);

    // Get risk assessment from LLM
    const riskPrompt = getRiskAssessment(loanData);
    const riskResponse = await generateWithLLM(riskPrompt);

    // Return enhanced data
    res.status(200).json({
      original: loanData,
      enhanced: {
        summary: summaryResponse,
        riskAssessment: riskResponse
      }
    });
  } catch (error) {
    console.error('Error enhancing loan data:', error);
    res.status(500).json({ error: 'Failed to enhance loan data' });
  }
}; 