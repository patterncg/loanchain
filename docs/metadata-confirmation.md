# Metadata Confirmation Implementation

## Overview

The Metadata Confirmation feature (TOKEN-003) extends the loan creation wizard with a final confirmation step where users can review the metadata that will be minted as an NFT on the blockchain. This document outlines the implementation details, component structure, and integration points.

## Components

### MetadataConfirmation

The core component responsible for displaying the metadata and seeking user confirmation before minting the loan token. Features include:

- Formatted and raw JSON views of the metadata
- Visual risk indicators
- User agreement checkbox
- Navigation controls (back and confirm)
- Integration with gas fee estimation

**File Location:** `apps/frontend/src/components/loan/MetadataConfirmation.tsx`

### GasFeeEstimator

A supporting component that shows users the estimated gas fees for the minting transaction with options to select different transaction priorities:

- Base gas fee display
- Priority options (slow, average, fast)
- Total fee calculation
- Informational tooltips

**File Location:** `apps/frontend/src/components/loan/GasFeeEstimator.tsx`

### Tooltip Component

A custom tooltip implementation for providing contextual help in the UI:

- Simple hover-based tooltips
- Positioning options (top, right, bottom, left)
- Animation effects

**File Location:** `apps/frontend/src/components/ui/tooltip.tsx`

## Integration

The Metadata Confirmation step has been integrated into the existing `LoanCreationWizard` component as the final step in the loan creation process:

1. User fills out loan details (step 1)
2. User adds borrower information (step 2)
3. User defines loan terms (step 3)
4. AI enhancement is performed and preview displayed (step 4)
5. **Metadata confirmation and gas fee selection** (step 5)

## Data Flow

1. Enhanced loan data is passed from the `LoanCreationWizard` to the `MetadataConfirmation` component
2. Mock metadata is created to simulate what will be stored on IPFS
3. User reviews and confirms the metadata
4. Gas fee preferences are captured via the `GasFeeEstimator`
5. On confirmation, the form submission handler in `LoanCreationWizard` is triggered

## User Experience Enhancements

- Visual representation of risk assessment using color-coded badges
- Tabbed interface to switch between formatted and raw JSON views
- Preview of token image in a modal dialog
- Clear explanation of blockchain permanence
- Interactive gas fee selection

## Future Improvements

- Connect to actual blockchain for real-time gas estimates
- Implement actual metadata creation using the `@loanchain/metadata` package
- Use IPFS upload via the `@loanchain/storage` package
- Implement transaction handling and blockchain integration

## Related Tasks

- **TOKEN-002** (Completed): Prepare Metadata JSON
- **TOKEN-004** (Not Started): Smart Contract Integration
- **TOKEN-005** (Not Started): Transaction Handling
- **TOKEN-006** (Not Started): Redirect to Token Detail View
