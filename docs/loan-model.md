# LoanChain Simplified Loan Model

This document outlines the simplified loan model used in the LoanChain application. The model has been streamlined to focus on the most essential components of a loan while maintaining flexibility for extension.

## Core Loan Components

The fundamental elements of any loan are:

1. **Amount** - The principal amount of the loan
2. **Interest Rate** - The annual percentage rate (APR) charged on the loan
3. **Term** - The duration of the loan in months

These three components represent the minimum required information to define a loan and are mandatory in all loan creation flows.

## Simplified Data Model

### LoanDetails

The `LoanDetails` interface represents the core loan data:

```typescript
interface LoanDetails {
  amount: number;
  interestRate: number;
  term: number;
  purpose?: string;
  collateral?: string;
}
```

### LoanForm

The `LoanForm` wraps the loan details in a structure suitable for form handling:

```typescript
interface LoanForm {
  loanDetails: LoanDetails;
}
```

### AiEnhancedLoan

The `AiEnhancedLoan` type represents a loan that has been processed by AI for risk assessment:

```typescript
type AiEnhancedLoan = {
  original: LoanForm;
  enhanced: {
    riskScore?: number;
    riskAssessment?: string;
  };
};
```

## Validation

Validation is implemented using Zod schemas:

```typescript
const loanDetailsSchema = z.object({
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
  purpose: z.string().optional(),
  collateral: z.string().optional(),
});
```

## User Interface

The loan creation process has been simplified to just two steps:

1. **Loan Details Form** - Where users input the core loan information
2. **Confirmation** - Where users review the loan details and metadata before minting a token

### Loan Details Form

The form focuses on collecting the three essential components, with optional fields for purpose and collateral:

- Amount (required): The principal amount of the loan
- Interest Rate (required): The APR as a percentage
- Term (required): Duration in months
- Purpose (optional): The intended use of the loan
- Collateral (optional): Any assets securing the loan

### Metadata Confirmation

The confirmation screen displays:

- Core loan details (amount, interest rate, term)
- Optional fields if provided
- AI-enhanced risk assessment
- Blockchain details and gas fee information

## Blockchain Integration

When a loan is minted as a token on the blockchain, the following metadata is stored:

```json
{
  "id": "loan-123456789",
  "amount": 10000,
  "interestRate": 5.25,
  "term": 36,
  "purpose": "Home renovation",
  "issuer": "0x1234...",
  "timestamp": 1700123456789,
  "riskScore": 65,
  "riskAssessment": "Medium Risk",
  "schemaVersion": "1.0.0"
}
```

## Extending the Model

While the core model is intentionally simplified, it can be extended by:

1. Adding more optional fields to the `LoanDetails` interface
2. Enhancing the AI assessment with additional properties
3. Adding specialized interfaces for different loan types

## Benefits of the Simplified Model

- **Clarity**: Focuses on the essential components that define a loan
- **Usability**: Simplifies the user experience by reducing form complexity
- **Learnability**: Makes it easier to understand the loan creation process
- **Maintainability**: Reduces code complexity and potential points of failure

## Best Practices

When working with the simplified loan model:

1. Always validate user input using the provided Zod schemas
2. Maintain type safety through consistent use of TypeScript interfaces
3. Keep UI components focused on the core data elements
4. Use optional fields judiciously to avoid cluttering the interface 