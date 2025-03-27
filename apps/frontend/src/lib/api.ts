import { LoanForm, AiEnhancedLoan } from "@/schemas/loan";

// Base URL for the AI server API
// This is exported for configuration purposes but commented out in actual implementation
export const AI_API_BASE_URL = "http://localhost:3001/api";

/**
 * Enhanced Loan API
 * 
 * Services to interact with the AI loan enhancement service
 */
export const loanApi = {
  /**
   * Enhance loan data with AI-powered insights
   * 
   * @param loanData The loan form data to be enhanced
   * @returns Promise with enhanced loan data
   */
  async enhanceLoan(loanData: LoanForm): Promise<AiEnhancedLoan> {
    try {
      // In a real implementation, this would make an actual API call using AI_API_BASE_URL
      // const response = await fetch(`${AI_API_BASE_URL}/enhance-loan`, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify(loanData),
      // });
      
      // if (!response.ok) {
      //   throw new Error(`API error: ${response.status}`);
      // }
      
      // return await response.json();
      
      // Simulated response for now (since we don't have a real AI server yet)
      return mockEnhanceLoanResponse(loanData);
    } catch (error) {
      console.error("Error enhancing loan data:", error);
      throw error;
    }
  },
};

/**
 * Mock function to simulate AI enhancement while we don't have a real server
 */
function mockEnhanceLoanResponse(loanData: LoanForm): AiEnhancedLoan {
  // Calculate a sample risk score based on loan amount and interest rate
  const amount = loanData.loanDetails.amount;
  const interestRate = loanData.loanDetails.interestRate;
  
  // Simple algorithm for mock risk score (0-100)
  const riskScore = Math.min(
    Math.round(
      (amount > 10000 ? 50 : 30) + 
      (interestRate < 5 ? 20 : 0) - 
      (amount < 5000 ? 15 : 0)
    ), 
    100
  );
  
  // Risk assessment based on score
  let riskAssessment = "Low Risk";
  if (riskScore > 70) {
    riskAssessment = "High Risk";
  } else if (riskScore > 40) {
    riskAssessment = "Medium Risk";
  }
  
  return {
    original: loanData,
    enhanced: {
      riskScore,
      riskAssessment
    }
  };
} 