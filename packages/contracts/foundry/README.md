# LoanChain Contracts (Foundry)

This directory contains the smart contracts for the LoanChain project, built and tested using Foundry.

## Overview

The LoanChain contracts implement a decentralized lending platform on Moonbeam. The core functionality is provided by the `LoanToken` contract, which is an ERC-721 implementation that represents loan agreements.

## Contracts

- `LoanToken.sol`: An ERC-721 token that represents loan agreements. Each token contains metadata about the loan terms and links to the issuer.

## Development Setup

### Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation) - Ethereum development toolchain

### Building

```bash
# Navigate to contracts package
cd packages/contracts

# Build the contracts
forge build
```

### Testing

```bash
# Navigate to contracts package
cd packages/contracts

# Run the tests
forge test

# Run tests with gas report
forge test --gas-report

# Run tests with verbosity
forge test -vvv
```

### Deploying

To deploy the contracts to Moonbase Alpha (Moonbeam testnet):

1. Create a `.env` file with the following:
```env
PRIVATE_KEY=your_private_key
MOONBASE_RPC_URL=https://rpc.api.moonbase.moonbeam.network
MOONSCAN_API_KEY=your_moonscan_api_key
```

2. Source the environment and deploy:
```bash
source .env
forge script script/DeployLoanToken.s.sol:DeployLoanToken --rpc-url $MOONBASE_RPC_URL --broadcast --verify
```

## Contract Interactions

### Minting a Loan Token

To mint a new loan token:

```solidity
// Address of the token recipient
address recipient = 0x...;

// IPFS URI pointing to the metadata for this loan
string memory metadataURI = "ipfs://...";

// Mint the token
uint256 tokenId = loanToken.mintLoanToken(recipient, metadataURI);
```

### Querying Tokens

```solidity
// Get all loan tokens
uint256[] memory allTokens = loanToken.getAllLoanTokens();

// Get tokens owned by a specific address
uint256[] memory userTokens = loanToken.getLoanTokensByOwner(userAddress);

// Get token metadata
string memory uri = loanToken.tokenURI(tokenId);
address issuer = loanToken.getTokenIssuer(tokenId);
```

## License

The contracts are licensed under the MIT License. 