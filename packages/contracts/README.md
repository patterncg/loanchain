# LoanChain Contracts

This package contains the smart contracts for the LoanChain project, a decentralized lending platform on Moonbeam.

## Overview

The contracts implement the core functionality for the LoanChain platform, allowing users to create, manage, and trade loan agreements. The contracts are built using Solidity and are compatible with the Moonbeam blockchain.

## Development Environments

The contracts package supports two development environments:

### Hardhat

The original development environment, which provides a JavaScript-based testing and deployment framework.

### Foundry

A newer, more efficient development environment written in Rust, which provides faster compilation and testing. Foundry is the recommended environment for contract development.

## Directory Structure

- `/contracts`: Original Hardhat contracts
- `/test`: Hardhat tests
- `/foundry`: Foundry development files
  - `/src`: Foundry contract source files
  - `/test`: Foundry test files
  - `/script`: Foundry deployment scripts
- `/lib`: External dependencies managed by Forge
- `/ignition`: Hardhat Ignition modules for deployment

## Key Contracts

### LoanToken (ERC-721)

An NFT implementation representing loan agreements with the following features:

- Role-based access control with MINTER_ROLE and LOAN_MANAGER_ROLE
- Metadata for loan terms (amount, due date, etc.)
- Status tracking (Active, Repaid, Defaulted, etc.)
- IPFS integration for loan terms documents
- Enumerable token support for easy querying

## Development Setup

### Foundry Environment

To work with Foundry, install it following the [Foundry Book instructions](https://book.getfoundry.sh/):

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### Building and Testing

#### Using Foundry (recommended)

```bash
# Build contracts
forge build

# Run tests
forge test

# Run tests with gas reporting
forge test --gas-report

# Deploy contracts (to Moonbase Alpha testnet)
source .env # After creating .env from .env.example
forge script foundry/script/DeployLoanToken.s.sol:DeployLoanToken --rpc-url $MOONBASE_RPC_URL --broadcast --verify
```

#### Using Hardhat

```bash
# Build contracts
npx hardhat compile

# Run tests
npx hardhat test
```

## License

These contracts are licensed under the MIT license.
