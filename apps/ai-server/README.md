# LoanChain AI Server

The AI Server component of the LoanChain platform, responsible for enhancing loan data with AI-generated insights and risk assessments.

## Features

- Loan summary generation
- Risk assessment with tagging
- Connection to local LLM (llama.cpp or Ollama)

## Setup

### Prerequisites

- Node.js 18+
- PNPM package manager
- [Ollama](https://ollama.ai/) installed and running locally
- LLM model (default: llama3) pulled to your Ollama installation

### Installation

```bash
# Install dependencies
pnpm install

# Build the project
pnpm build
```

### Configuration

Create a `.env` file in the root directory with the following variables:

```
PORT=3001
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3
```

You can change the model to any model available in your Ollama installation.

### Running the Server

```bash
# Development mode with hot reloading
pnpm dev

# Production mode
pnpm start
```

## API Endpoints

### Health Check

```
GET /health
```

Returns the status of the AI server.

### Enhance Loan Data

```
POST /api/enhance-loan
```

Takes loan data and returns enhanced data with AI-generated insights.

#### Request body example

```json
{
  "borrowerName": "John Doe",
  "loanAmount": 50000,
  "interestRate": 5.5,
  "loanTerm": 36,
  "collateralType": "Real Estate",
  "collateralValue": 150000,
  "borrowerCreditScore": 720,
  "purpose": "Home renovation"
}
```

#### Response example

```json
{
  "original": {
    "borrowerName": "John Doe",
    "loanAmount": 50000,
    "interestRate": 5.5,
    "loanTerm": 36,
    "collateralType": "Real Estate",
    "collateralValue": 150000,
    "borrowerCreditScore": 720,
    "purpose": "Home renovation"
  },
  "enhanced": {
    "summary": "John Doe has been approved for a $50,000 loan at 5.5% interest over 36 months for home renovation. The loan is secured by real estate valued at $150,000, providing a strong collateral position with a loan-to-value ratio of 33.3%.",
    "riskAssessment": {
      "riskRating": "Low",
      "riskFactors": [
        "Loan-to-value ratio is strong at 33.3%",
        "Good credit score of 720",
        "Reasonable interest rate of 5.5%",
        "Purpose of loan (home renovation) may increase property value"
      ],
      "recommendations": [
        "Consider periodic assessment of collateral value",
        "Offer optional payment protection insurance"
      ]
    }
  }
}
```

## Development

### Project Structure

- `/src`: Source code
  - `/controllers`: Request handlers
  - `/routes`: API routes
  - `/templates`: LLM prompt templates
  - `/utils`: Utility functions
- `/dist`: Compiled JavaScript

### LLM Configuration

To use a different LLM model:

1. Make sure the model is installed in Ollama: `ollama pull <model_name>`
2. Update the `OLLAMA_MODEL` in your `.env` file
