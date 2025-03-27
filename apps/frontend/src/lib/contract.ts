import {
  ContractService,
  MetadataService,
  ChainId,
  networkConfigs,
} from "./contract-integration/index";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

// Get the contract address based on chain ID
export const getContractAddress = (
  chainId: number = ChainId.MOONBASE_ALPHA,
) => {
  const network = networkConfigs[chainId as ChainId];
  if (!network) {
    throw new Error(`Network configuration not found for chain ID: ${chainId}`);
  }
  return network.contracts.loanToken;
};

// Initialize contract service
export const getContractService = (
  chainId: number = ChainId.MOONBASE_ALPHA,
) => {
  return new ContractService({
    loanRegistryAddress: getContractAddress(chainId),
    chainId,
  });
};

// Initialize metadata service
export const getMetadataService = (
  chainId: number = ChainId.MOONBASE_ALPHA,
) => {
  const contractService = getContractService(chainId);

  // Use import.meta.env for Vite instead of process.env
  const pinataApiKey = import.meta.env.VITE_PINATA_API_KEY || "";
  const pinataSecretKey = import.meta.env.VITE_PINATA_SECRET_KEY || "";

  return new MetadataService({
    ipfsGateway: "https://gateway.pinata.cloud",
    pinataApiKey,
    pinataSecretKey,
    contractService,
  });
};

// React hook for contract integration
export const useContractIntegration = () => {
  const { address, chainId } = useAccount();
  const [metadataService, setMetadataService] =
    useState<MetadataService | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (chainId) {
        const service = getMetadataService(Number(chainId));
        setMetadataService(service);
        setError(null);
      } else {
        // Default to Moonbase Alpha if no chain ID is available
        const service = getMetadataService();
        setMetadataService(service);
      }
    } catch (err) {
      console.error("Error initializing contract services:", err);
      setError(
        "Failed to initialize contract services. Please check your network connection.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [chainId]);

  // Check if the user has minter role
  const checkMinterRole = async () => {
    if (!address || !metadataService) return false;

    try {
      const contractService = metadataService[
        "contractService"
      ] as ContractService;
      return await contractService.hasMinterRole(address);
    } catch (err) {
      console.error("Error checking minter role:", err);
      return false;
    }
  };

  // Estimate gas fee for minting
  const estimateGasFee = async () => {
    if (!address || !metadataService) return 0;

    try {
      return await metadataService.estimateGasFee(address);
    } catch (err) {
      console.error("Error estimating gas fee:", err);
      return 0;
    }
  };

  return {
    metadataService,
    isLoading,
    error,
    checkMinterRole,
    estimateGasFee,
    walletAddress: address,
  };
};
