# LoanChain Deployment Guide for Moonbase Alpha

This guide provides step-by-step instructions for deploying the LoanChain contracts to the Moonbase Alpha testnet.

## Prerequisites

Before starting, make sure you have:

1. [Foundry](https://book.getfoundry.sh/getting-started/installation) installed
2. A wallet with testnet DEV tokens (Moonbase Alpha's native tokens)
3. Your private key for deployment (never share this or commit it to version control)
4. A Moonscan API key for contract verification (optional but recommended)

## Getting Testnet DEV Tokens

If you don't have testnet DEV tokens, you can get them from:
- Moonbase Alpha Faucet: https://apps.moonbeam.network/moonbase-alpha/faucet/

## Step 1: Environment Setup

1. Navigate to the contracts package:
   ```bash
   cd packages/contracts
   ```

2. Create a `.env` file with your credentials:
   ```bash
   cp .env.example .env
   ```

3. Edit the `.env` file with your private key, RPC URL, and API key:
   ```
   # Deployer private key (without 0x prefix)
   PRIVATE_KEY=your_private_key_here
   
   # RPC URLs
   MOONBASE_RPC_URL=https://rpc.api.moonbase.moonbeam.network
   
   # Explorer API keys
   MOONSCAN_API_KEY=your_moonscan_api_key_here
   
   # Base URI for token metadata (update if you have a custom API)
   BASE_URI=https://api.loanchain.example/metadata/
   ```

4. Source the environment variables:
   ```bash
   source .env
   ```

## Step 2: Build the Contracts

Build the contracts using Foundry:

```bash
forge build
```

## Step 3: Deploy to Moonbase Alpha

Deploy the contracts using the specialized Moonbase Alpha deployment script:

```bash
forge script foundry/script/DeployToMoonbaseAlpha.s.sol:DeployToMoonbaseAlpha --rpc-url $MOONBASE_RPC_URL --broadcast --verify
```

If you prefer not to verify immediately, you can deploy without the `--verify` flag:

```bash
forge script foundry/script/DeployToMoonbaseAlpha.s.sol:DeployToMoonbaseAlpha --rpc-url $MOONBASE_RPC_URL --broadcast
```

Make sure to save the contract address that gets printed in the console.

## Step 4: Verify the Contract (Optional)

If you didn't use the `--verify` flag during deployment, you can verify the contract separately:

```bash
forge verify-contract --chain-id 1287 --compiler-version 0.8.24 <DEPLOYED_ADDRESS> LoanToken --watch --api-key $MOONSCAN_API_KEY
```

Replace `<DEPLOYED_ADDRESS>` with your deployed contract address.

## Step 5: Update Frontend Configuration

Update the frontend environment variables with the new contract address:

1. Navigate to the frontend app:
   ```bash
   cd ../../apps/frontend
   ```

2. Create or update the `.env.local` file:
   ```
   VITE_LOAN_REGISTRY_ADDRESS=<DEPLOYED_ADDRESS>
   VITE_CHAIN_ID=1287
   ```

3. Replace `<DEPLOYED_ADDRESS>` with your actual deployed contract address.

## Step 6: Test the Deployment

1. Check if the contract is accessible:
   ```bash
   cast call <DEPLOYED_ADDRESS> "name()" --rpc-url $MOONBASE_RPC_URL
   ```

2. Check if the contract is properly initialized:
   ```bash
   cast call <DEPLOYED_ADDRESS> "owner()" --rpc-url $MOONBASE_RPC_URL
   ```

## Contract Addresses

After deployment, add your contract addresses below:

| Contract | Address | Explorer Link |
|----------|---------|--------------|
| LoanToken | TBD | TBD |

## Troubleshooting

### Common Issues

1. **Transaction Failed**: Make sure you have enough DEV tokens for gas fees.
2. **Verification Failed**: Double-check your Moonscan API key and ensure the contract compiles with the exact same settings.
3. **RPC Errors**: If the Moonbase Alpha RPC is unresponsive, try an alternative RPC URL from [Moonbeam docs](https://docs.moonbeam.network/builders/get-started/endpoints/).

### Useful Commands

- Check your DEV balance:
  ```bash
  cast balance <YOUR_ADDRESS> --rpc-url $MOONBASE_RPC_URL
  ```

- Test contract function calls:
  ```bash
  cast call <CONTRACT_ADDRESS> "functionName(arg1Type,arg2Type)(returnType)" "arg1" "arg2" --rpc-url $MOONBASE_RPC_URL
  ```

## Next Steps

After successful deployment:

1. Test the entire loan creation flow with the frontend
2. Document any issues in the project's issue tracker
3. Update the project documentation with the new contract addresses 