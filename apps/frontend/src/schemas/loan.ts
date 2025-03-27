import * as z from "zod";

// Simplified loan details schema
export const loanDetailsSchema = z.object({
  amount: z.coerce
    .number({ required_error: "Loan amount is required" })
    .positive("Loan amount must be greater than 0"),
  interestRate: z.coerce
    .number({ required_error: "Interest rate is required" })
    .min(0, "Interest rate cannot be negative")
    .max(100, "Interest rate cannot exceed 100%"),
  term: z.coerce
    .number({ required_error: "Loan term is required" })
    .int("Term must be a whole number")
    .positive("Term must be greater than 0"),
  // Optional fields
  purpose: z.string().optional(),
  collateral: z.string().optional(),
});

// Simplified loan form schema with only the essential details
export const loanFormSchema = z.object({
  loanDetails: loanDetailsSchema,
});

// Type definitions based on the schemas
export type LoanDetails = z.infer<typeof loanDetailsSchema>;
export type LoanForm = z.infer<typeof loanFormSchema>;

// AI-enhanced loan schema (simplified version)
export type AiEnhancedLoan = {
  original: LoanForm;
  enhanced: {
    riskScore?: number;
    riskAssessment?: string;
  };
}; 