/**
 * Example usage of the metadata service
 * 
 * This file serves as documentation and is not meant to be executed directly.
 * It demonstrates how to use the metadata service in an application.
 */

import { EnhancedLoanData } from '@loanchain/storage';
import { MetadataService, createLoanSummary, assessRisk } from './index';

/**
 * Example function demonstrating how to create and validate metadata
 */
async function exampleCreateMetadata() {
  // Initialize the metadata service
  const metadataService = new MetadataService({
    baseExternalUrl: 'https://app.loanchain.example/loans/',
    schemaVersion: '1.0.0'
  });

  // Create sample loan data
  const loanData: EnhancedLoanData = {
    amount: 10000,
    interestRate: 5.5,
    term: 36,
    collateralType: 'Real Estate',
    collateralValue: 250000,
    purpose: 'Home Improvement',
    borrowerDetails: {
      name: 'Jane Smith',
      creditScore: 780
    },
    // Generate a summary
    aiSummary: createLoanSummary('Home Improvement', 10000, 36, 'Real Estate'),
    // Calculate a risk tag
    riskTag: assessRisk(10000, 250000, 36, 780),
    // Set the issuer (typically a wallet address)
    issuer: '0x1234567890123456789012345678901234567890'
  };

  // Create metadata with all required fields
  const metadata = metadataService.createMetadata(loanData, {
    includeAttributes: true,
    generateId: true
  });

  console.log('Created metadata:');
  console.log(JSON.stringify(metadata, null, 2));

  // Validate the metadata
  const validationResult = metadataService.validateMetadata(metadata);
  
  if (validationResult.valid) {
    console.log('Metadata is valid!');
  } else {
    console.error('Metadata validation failed:', validationResult.errors);
  }

  return metadata;
}

/**
 * Example function demonstrating how to update existing metadata
 */
async function exampleUpdateMetadata() {
  const metadataService = new MetadataService();
  
  // Get existing metadata (in a real application, this would come from IPFS)
  const existingMetadata = await exampleCreateMetadata();
  
  // Update with new information
  const updatedMetadata = metadataService.updateMetadata(existingMetadata, {
    // Update loan status
    status: 'Repaid',
    // Add new information
    mintTransactionId: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    mintBlockNumber: 12345678
  });

  console.log('Updated metadata:');
  console.log(JSON.stringify(updatedMetadata, null, 2));

  return updatedMetadata;
}

/**
 * Example of the complete flow of working with metadata
 */
async function exampleCompleteMetadataFlow() {
  // Step 1: User inputs loan data
  const userInputData = {
    amount: 15000,
    interestRate: 4.25,
    term: 24,
    collateralType: 'Vehicle',
    collateralValue: 35000,
    purpose: 'Vehicle Purchase',
    borrowerDetails: {
      name: 'John Doe',
      creditScore: 720
    }
  };

  // Step 2: Generate AI enhancements (typically from AI service)
  const aiEnhancements = {
    aiSummary: 'This is a medium-risk loan for purchasing a vehicle worth $35,000. The loan amount is $15,000 with an interest rate of 4.25% over 24 months. The borrower has a good credit score of 720.',
    riskTag: 'Medium Risk'
  };

  // Step 3: Combine data to create enhanced loan data
  const enhancedLoanData: EnhancedLoanData = {
    ...userInputData,
    ...aiEnhancements,
    // Add the issuer address (from wallet)
    issuer: '0x9876543210987654321098765432109876543210'
  };

  // Step 4: Create metadata
  const metadataService = new MetadataService();
  const metadata = metadataService.createMetadata(enhancedLoanData);

  // Step 5: Validate metadata
  const validationResult = metadataService.validateWithZod(metadata);
  if (!validationResult.valid) {
    console.error('Metadata validation failed:', validationResult.errors);
    throw new Error('Invalid metadata');
  }

  // Step 6: In a real application, you would upload to IPFS
  console.log('Metadata ready for upload to IPFS:');
  console.log(JSON.stringify(metadata, null, 2));

  // Step 7: After minting, update with blockchain information
  const updatedMetadata = metadataService.updateMetadata(metadata, {
    status: 'Active',
    mintTransactionId: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    mintBlockNumber: 9876543,
    metadataUri: 'ipfs://QmYourMetadataHash'
  });

  console.log('Final metadata with blockchain information:');
  console.log(JSON.stringify(updatedMetadata, null, 2));

  return updatedMetadata;
}

// These functions would be called from your application code
// exampleCreateMetadata();
// exampleUpdateMetadata();
// exampleCompleteMetadataFlow(); 