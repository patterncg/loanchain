import { z } from 'zod';
import { LoanStatus } from '../types.js';

// Borrower details schema
export const borrowerDetailsSchema = z.object({
  name: z.string().optional(),
  creditScore: z.number().min(300).max(850).optional()
}).optional();

// Loan metadata schema
export const loanMetadataSchema = z.object({
  id: z.string(),
  amount: z.number().min(0),
  interestRate: z.number().min(0),
  term: z.number().min(1),
  collateralType: z.string().optional(),
  collateralValue: z.number().min(0).optional(),
  purpose: z.string(),
  borrowerDetails: borrowerDetailsSchema,
  aiSummary: z.string().optional(),
  riskTag: z.string().optional(),
  issuer: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  timestamp: z.number(),
  loanTermsDocumentUrl: z.string().url().optional(),
  status: z.nativeEnum(LoanStatus).optional(),
  dueDate: z.number().optional(),
  metadataUri: z.string().url().optional(),
  mintTransactionId: z.string().regex(/^0x[a-fA-F0-9]{64}$/).optional(),
  mintBlockNumber: z.number().optional(),
  tags: z.array(z.string()).optional(),
  schemaVersion: z.string()
});

// NFT attribute schema
export const nftAttributeSchema = z.object({
  trait_type: z.string(),
  value: z.union([z.string(), z.number()]),
  display_type: z.enum(['number', 'date', 'boost_percentage', 'boost_number']).optional()
});

// NFT metadata schema
export const nftMetadataSchema = z.object({
  name: z.string(),
  description: z.string(),
  image: z.string().url(),
  external_url: z.string().url().optional(),
  animation_url: z.string().url().optional(),
  attributes: z.array(nftAttributeSchema).optional(),
  properties: loanMetadataSchema
});

// Schema types
export type LoanMetadataSchemaType = z.infer<typeof loanMetadataSchema>;
export type NFTMetadataSchemaType = z.infer<typeof nftMetadataSchema>; 