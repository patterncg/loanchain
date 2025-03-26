import * as z from "zod";

// Loan details schema
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
  termUnit: z.enum(["days", "weeks", "months", "years"], {
    required_error: "Please select a term unit",
  }),
  purpose: z.string().min(1, "Loan purpose is required").max(100),
  collateral: z.string().optional(),
});

// Borrower information schema
export const borrowerSchema = z.object({
  name: z.string().optional(),
  contactInfo: z.string().email("Invalid email address").optional(),
  creditScore: z.coerce
    .number()
    .int("Credit score must be a whole number")
    .min(300, "Credit score must be at least 300")
    .max(850, "Credit score cannot exceed 850")
    .optional(),
  incomeVerification: z.boolean().optional(),
  additionalInfo: z.string().optional(),
});

// Terms and conditions schema
export const termsSchema = z.object({
  paymentFrequency: z.enum(["daily", "weekly", "bi-weekly", "monthly"], {
    required_error: "Please select a payment frequency",
  }),
  earlyRepaymentPenalty: z.coerce.number().min(0).optional(),
  lateFeePercentage: z.coerce.number().min(0).max(100).optional(),
  collateralRequirements: z.string().optional(),
  agreementToTerms: z.boolean().default(false).refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
});

// Complete loan form schema combining all steps
export const loanFormSchema = z.object({
  loanDetails: loanDetailsSchema,
  borrower: borrowerSchema.optional(),
  terms: termsSchema,
});

// Type definitions based on the schemas
export type LoanDetails = z.infer<typeof loanDetailsSchema>;
export type Borrower = z.infer<typeof borrowerSchema>;
export type Terms = z.infer<typeof termsSchema>;
export type LoanForm = z.infer<typeof loanFormSchema>;

// AI-enhanced loan schema (what we expect to get back from the AI service)
export type AiEnhancedLoan = {
  original: LoanForm;
  enhanced: {
    riskScore: number;
    riskAssessment: string;
    recommendedInterestRate?: number;
    recommendedCollateral?: string;
    marketComparison?: string;
    additionalNotes?: string;
  };
}; 