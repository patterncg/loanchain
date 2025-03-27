/**
 * Contract addresses and configuration for different networks
 */

export enum ChainId {
  MOONBASE_ALPHA = 1287, // Moonbase Alpha TestNet
  MOONBEAM = 1284, // Moonbeam MainNet
  MOONRIVER = 1285, // Moonriver
  DEVELOPMENT = 31337, // Local development network
}

export interface NetworkConfig {
  name: string;
  rpcUrl: string;
  blockExplorer: string;
  contracts: {
    loanToken: string;
  };
}

/**
 * Configuration for different networks
 */
export const networkConfigs: Record<ChainId, NetworkConfig> = {
  [ChainId.MOONBASE_ALPHA]: {
    name: "Moonbase Alpha",
    rpcUrl: "https://rpc.api.moonbase.moonbeam.network",
    blockExplorer: "https://moonbase.moonscan.io",
    contracts: {
      // This address should be replaced with the actual deployed contract address
      loanToken: "0x0000000000000000000000000000000000000000",
    },
  },
  [ChainId.MOONBEAM]: {
    name: "Moonbeam",
    rpcUrl: "https://rpc.api.moonbeam.network",
    blockExplorer: "https://moonbeam.moonscan.io",
    contracts: {
      // Production addresses would be added here after deployment
      loanToken: "0x0000000000000000000000000000000000000000",
    },
  },
  [ChainId.MOONRIVER]: {
    name: "Moonriver",
    rpcUrl: "https://rpc.api.moonriver.moonbeam.network",
    blockExplorer: "https://moonriver.moonscan.io",
    contracts: {
      loanToken: "0x0000000000000000000000000000000000000000",
    },
  },
  [ChainId.DEVELOPMENT]: {
    name: "Development",
    rpcUrl: "http://localhost:8545",
    blockExplorer: "",
    contracts: {
      // This would be the locally deployed contract address
      loanToken: "0x5FbDB2315678afecb367f032d93F642f64180aa3", // Default Foundry deployment address
    },
  },
};

/**
 * Default configuration to use in the application
 */
export const defaultConfig = {
  chainId: ChainId.MOONBASE_ALPHA,
  contractAddresses: networkConfigs[ChainId.MOONBASE_ALPHA].contracts,
};
