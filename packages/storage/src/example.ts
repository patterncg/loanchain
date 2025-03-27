/**
 * Example usage of the IPFS service
 *
 * This file serves as documentation and is not meant to be executed directly.
 * It demonstrates how to use the IPFS service in an application.
 */

import { IPFSService, EnhancedLoanData } from "./index";

/**
 * Example function demonstrating how to use the IPFS service to upload loan metadata
 */
async function exampleUploadLoanMetadata() {
  // Initialize the IPFS service
  const ipfsService = new IPFSService({
    token: process.env.NFT_STORAGE_KEY || "",
  });

  // Example loan data
  const loanData: EnhancedLoanData = {
    amount: 5000,
    interestRate: 4.5,
    term: 24,
    collateralType: "Vehicle",
    collateralValue: 15000,
    purpose: "Vehicle Repair",
    borrowerDetails: {
      name: "John Doe",
      creditScore: 720,
    },
    aiSummary:
      "This is a medium-risk loan for vehicle repairs with good collateral coverage.",
    riskTag: "Medium Risk",
  };

  try {
    // Upload the metadata
    const result = await ipfsService.uploadMetadata(loanData);

    console.log("Metadata uploaded successfully:");
    console.log("- URL:", result.url);
    console.log("- CID:", result.cid);

    return result.url;
  } catch (error) {
    console.error("Failed to upload metadata:", error);
    throw error;
  }
}

/**
 * Example function demonstrating how to upload a file to IPFS
 */
async function exampleUploadFile() {
  // Initialize the IPFS service
  const ipfsService = new IPFSService({
    token: process.env.NFT_STORAGE_KEY || "",
  });

  // Example file data (in a real application, this would come from a file)
  const fileData = Buffer.from("This is an example file content");

  try {
    // Upload the file
    const result = await ipfsService.uploadFile(fileData, {
      fileName: "example.txt",
      contentType: "text/plain",
    });

    console.log("File uploaded successfully:");
    console.log("- URL:", result.url);
    console.log("- CID:", result.cid);
    console.log("- Size:", result.size, "bytes");

    return result.url;
  } catch (error) {
    console.error("Failed to upload file:", error);
    throw error;
  }
}

/**
 * Example function demonstrating the complete flow of uploading and linking to a smart contract
 */
async function exampleCompleteFlow() {
  const ipfsService = new IPFSService({
    token: process.env.NFT_STORAGE_KEY || "",
  });

  // 1. Upload a document (e.g., loan terms)
  const documentData = Buffer.from("Loan Terms and Conditions...");
  const documentResult = await ipfsService.uploadFile(documentData, {
    fileName: "loan-terms.txt",
    contentType: "text/plain",
  });

  // 2. Create loan data with reference to the document
  const loanData: EnhancedLoanData = {
    amount: 10000,
    interestRate: 5.5,
    term: 36,
    collateralType: "Real Estate",
    collateralValue: 250000,
    purpose: "Home Improvement",
    borrowerDetails: {
      name: "Jane Smith",
      creditScore: 780,
    },
    // Include a reference to the uploaded document
    loanTermsDocumentUrl: documentResult.url,
    aiSummary:
      "This is a low-risk loan for home improvements with excellent collateral coverage.",
    riskTag: "Low Risk",
    // Add the current timestamp
    timestamp: Date.now(),
  };

  // 3. Upload the complete metadata
  const metadataResult = await ipfsService.uploadMetadata(loanData);

  console.log("Complete flow executed successfully:");
  console.log("- Document URL:", documentResult.url);
  console.log("- Metadata URL:", metadataResult.url);

  // 4. In a real application, you would then call the smart contract
  // to mint the NFT with the metadata URL
  console.log(
    "Next step: Call smart contract to mint the NFT with metadata URL",
  );

  return {
    documentUrl: documentResult.url,
    metadataUrl: metadataResult.url,
  };
}

// These functions would be called from your application code
// exampleUploadLoanMetadata();
// exampleUploadFile();
// exampleCompleteFlow();
