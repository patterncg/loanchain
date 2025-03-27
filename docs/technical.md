## Overview

This document outlines the technical architecture for a decentralized loan platform built on the Moonbase Alpha testnet. The system enables users to mint unique tokens representing loans with AI-enhanced metadata and provides a public feed for viewing loan tokens.

## Technology Stack

- **Frontend**: React + TailwindCSS + Shadcn/UI
- **Blockchain**: Moonbeam (Polkadot's EVM-compatible parachain)
- **Smart Contracts**: Solidity (ERC-721)
- **Development Framework**: Foundry/Hardhat
- **AI Integration**: Local LLM (llama.cpp/Ollama) with OpenAI fallback
- **Storage**: IPFS (via nft.storage)
- **Wallet Integration**: wagmi + viem
- **Monorepo**: pnpm workspaces

## Core Modules

### 1. Frontend Module

```typescript
// apps/frontend/src/components/LoanForm.tsx
interface LoanFormData {
  amount: number;
  interestRate: number;
  term: number;
  collateralType: string;
  collateralValue: number;
  purpose: string;
  borrowerDetails: {
    name: string;
    creditScore: number;
  };
}

export const LoanForm: React.FC = () => {
  const { address } = useAccount();
  const { write } = useContractWrite({
    address: LOAN_REGISTRY_ADDRESS,
    abi: LOAN_REGISTRY_ABI,
    functionName: "mintLoanToken",
  });

  const handleSubmit = async (data: LoanFormData) => {
    // Form submission and token minting logic
  };
};
```

### 2. Smart Contract Module

```solidity
// contracts/LoanRegistry.sol
contract LoanRegistry is ERC721, Ownable {
    struct LoanMetadata {
        uint256 amount;
        uint256 interestRate;
        uint256 term;
        string collateralType;
        uint256 collateralValue;
        string purpose;
        string aiSummary;
        string riskTag;
        uint256 timestamp;
    }

    mapping(uint256 => LoanMetadata) public loans;
    uint256 private _tokenIdCounter;

    constructor() ERC721("LoanToken", "LOAN") {}

    function mintLoanToken(
        address to,
        string memory metadataURI,
        LoanMetadata memory metadata
    ) public returns (uint256) {
        uint256 tokenId = _tokenIdCounter++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);
        loans[tokenId] = metadata;
        return tokenId;
    }
}
```

### 3. AI Enhancement Module

```typescript
// apps/ai-server/src/services/loan-enhancement.service.ts
@Injectable()
export class LoanEnhancementService {
  constructor(
    private readonly llmService: LocalLLMService,
    private readonly openAiService: OpenAIService,
  ) {}

  async enhanceLoan(loanData: LoanData): Promise<EnhancedLoanData> {
    try {
      return await this.llmService.processLoan(loanData);
    } catch (error) {
      // Fallback to OpenAI
      return await this.openAiService.processLoan(loanData);
    }
  }
}
```

### 4. Token Module

```typescript
// packages/token/src/token.service.ts
export class TokenService {
  constructor(
    private readonly ipfsService: IPFSService,
    private readonly contractService: ContractService,
  ) {}

  async mintLoanToken(
    loanData: EnhancedLoanData,
    address: string,
  ): Promise<string> {
    // Upload metadata to IPFS
    const metadataURI = await this.ipfsService.uploadMetadata(loanData);

    // Mint token
    return await this.contractService.mintToken(address, metadataURI, loanData);
  }
}
```

## IPFS Integration

### NFT.Storage Configuration

```typescript
// packages/storage/src/ipfs.service.ts
export class IPFSService {
  private client: NFTStorage;

  constructor() {
    this.client = new NFTStorage({ token: process.env.NFT_STORAGE_KEY });
  }

  async uploadMetadata(data: EnhancedLoanData): Promise<string> {
    const metadata = await this.client.store({
      name: `Loan Token #${data.id}`,
      description: data.aiSummary,
      image: "ipfs://...", // Default loan token image
      properties: {
        ...data,
        timestamp: Date.now(),
      },
    });
    return metadata.url;
  }
}
```

## Blockchain Integration

### Contract Deployment

```typescript
// scripts/deploy.ts
async function main() {
  const LoanRegistry = await ethers.getContractFactory("LoanRegistry");
  const loanRegistry = await LoanRegistry.deploy();
  await loanRegistry.deployed();

  console.log("LoanRegistry deployed to:", loanRegistry.address);
}
```

## Development Workflow

1. **Local Development**

```bash
# Install dependencies
pnpm install

# Start development environment
pnpm dev

# Deploy contracts to Moonbase Alpha
pnpm deploy:moonbase

# Run tests
pnpm test
```

2. **Testing Strategy**

```typescript
// test/LoanRegistry.test.ts
describe("LoanRegistry", function () {
  let loanRegistry: LoanRegistry;
  let owner: SignerWithAddress;

  beforeEach(async function () {
    [owner] = await ethers.getSigners();
    const LoanRegistry = await ethers.getContractFactory("LoanRegistry");
    loanRegistry = await LoanRegistry.deploy();
  });

  it("Should mint a new loan token", async function () {
    // Test implementation
  });
});
```

## Project Structure

```
/
├── apps/
│   ├── frontend/          # React application
│   └── ai-server/         # Local AI wrapper
├── contracts/             # Solidity smart contracts
├── packages/
│   ├── ui/               # Shared UI components
│   ├── token/            # Token management
│   └── storage/          # IPFS integration
└── scripts/              # Deployment and verification
```

## Security Considerations

1. **Smart Contract Security**

   - Comprehensive testing with Foundry
   - External audit requirements
   - Access control implementation
   - Gas optimization

2. **AI Integration Security**

   - Input validation and sanitization
   - Rate limiting
   - Error handling and fallback mechanisms

3. **Frontend Security**
   - Secure wallet connection handling
   - Transaction signing validation
   - MetaMask integration best practices

## Future Considerations

1. **Scalability**

   - Layer 2 integration options
   - Cross-chain compatibility
   - Gas optimization strategies

2. **Feature Expansion**

   - Secondary market for loan tokens
   - DAO governance implementation
   - Advanced risk assessment models

3. **Integration Possibilities**
   - DeFi protocol integrations
   - Credit scoring oracles
   - Real-world asset bridging

## Deployment

### Vercel Deployment

```yaml
# vercel.json
{
  "version": 2,
  "builds": [{ "src": "apps/frontend/package.json", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "apps/frontend/$1" }],
}
```

### Environment Variables

```bash
# .env.example
NEXT_PUBLIC_MOONBASE_RPC_URL=
NEXT_PUBLIC_LOAN_REGISTRY_ADDRESS=
NFT_STORAGE_KEY=
LOCAL_LLM_ENDPOINT=
OPENAI_API_KEY=
```
