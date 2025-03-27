// Export contract service
export { ContractService } from './contract.service.js';
export type { ContractServiceConfig, MintTransactionResult } from './contract.service.js';

// Export metadata service
export { MetadataService } from './metadata.service.js';
export type { MetadataServiceConfig, MintResult, ExtendedLoanData } from './metadata.service.js';

// Export configuration
export { ChainId, networkConfigs, defaultConfig } from './config.js';
export type { NetworkConfig } from './config.js';

// Export ABIs
export { LoanTokenABI } from './abis/LoanToken.js'; 