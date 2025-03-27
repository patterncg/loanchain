# LoanChain - Decentralized Lending Platform

LoanChain is a decentralized lending platform built on the Moonbase Alpha testnet. It enables users to create, view, and manage loans through smart contracts.

## Project Structure

This is a simplified monorepo setup:

- **apps/frontend**: Main application UI (React + Vite)
- **apps/ai-server**: AI enhancement service for loan data
- **packages/contract-integration**: Smart contract interaction utilities
- **packages/metadata**: Loan metadata creation and validation
- **packages/storage**: IPFS integration for metadata storage

## Development

### Quickstart

```bash
# Install dependencies
pnpm install

# Start the main frontend app
pnpm dev:app

# Start the AI server (optional)
pnpm dev:ai

# Start everything (not recommended for regular development)
pnpm dev
```

### UI Components

The application uses [shadcn/ui](https://ui.shadcn.com/) with [Radix UI](https://www.radix-ui.com/) primitives for a consistent design system. All UI components are located in `apps/frontend/src/components/ui`.

### Smart Contract Integration

Smart contract interaction is simplified through the `contract-integration` package, which provides:

- Contract service for minting loan tokens
- Metadata service for IPFS storage and contract integration

## Project Simplification

The project has been streamlined for simplicity:

- Using a single UI library (shadcn/ui + Radix)
- Focused on core functionality (loan creation and viewing)
- Unnecessary test components removed
- Development workflow simplified

## Technologies

- **Frontend**: React 19, Vite, TailwindCSS, shadcn/ui
- **Backend**: Express (AI server)
- **Blockchain**: Moonbeam (EVM-compatible chain)
- **Smart Contracts**: Solidity, deployed on Moonbase Alpha testnet
- **Storage**: IPFS via nft.storage
- **Dev Tools**: TypeScript, Turbo, pnpm workspaces

## License

MIT
