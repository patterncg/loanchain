#!/bin/bash

# Deploy to Moonbase Alpha script
# This script automates the deployment of LoanChain contracts to Moonbase Alpha testnet

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== LoanChain Deployment to Moonbase Alpha ===${NC}"
echo -e "This script will deploy the LoanChain contracts to Moonbase Alpha."

# Check if .env file exists
if [ ! -f ".env" ]; then
  echo -e "${RED}Error: .env file not found.${NC}"
  echo "Please create a .env file with your deployment credentials."
  echo "You can copy .env.example for a template."
  exit 1
fi

# Load environment variables
source .env

# Check for required variables
if [ -z "$PRIVATE_KEY" ]; then
  echo -e "${RED}Error: PRIVATE_KEY is not set in your .env file.${NC}"
  exit 1
fi

if [ -z "$MOONBASE_RPC_URL" ]; then
  echo -e "${RED}Error: MOONBASE_RPC_URL is not set in your .env file.${NC}"
  exit 1
fi

# Check if BASE_URI is set, use default if not
if [ -z "$BASE_URI" ]; then
  echo -e "${YELLOW}Warning: BASE_URI not set, using default value.${NC}"
  export BASE_URI="https://api.loanchain.example/metadata/"
fi

# Build the contracts
echo -e "${YELLOW}Building contracts...${NC}"
forge build
if [ $? -ne 0 ]; then
  echo -e "${RED}Error: Contract build failed.${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Contracts built successfully.${NC}"

# Deploy the contracts
echo -e "${YELLOW}Deploying contracts to Moonbase Alpha...${NC}"
echo -e "Using RPC URL: $MOONBASE_RPC_URL"
echo -e "Using BASE_URI: $BASE_URI"

# Check if we should verify
VERIFY_FLAG=""
if [ ! -z "$MOONSCAN_API_KEY" ]; then
  echo -e "${YELLOW}Moonscan API key found. Will attempt to verify contracts.${NC}"
  VERIFY_FLAG="--verify"
else
  echo -e "${YELLOW}No Moonscan API key found. Skipping contract verification.${NC}"
  echo -e "You can verify the contract manually after deployment."
fi

# Perform the deployment
forge script foundry/script/DeployToMoonbaseAlpha.s.sol:DeployToMoonbaseAlpha --rpc-url $MOONBASE_RPC_URL --broadcast $VERIFY_FLAG

if [ $? -ne 0 ]; then
  echo -e "${RED}Error: Deployment failed.${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Deployment completed successfully!${NC}"
echo -e "${YELLOW}Don't forget to:${NC}"
echo "1. Save the contract address shown above"
echo "2. Update your frontend environment variables"
echo "3. Test the deployed contract"
echo ""
echo -e "${YELLOW}For more information, see the DEPLOY_GUIDE.md file.${NC}" 