// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {LoanToken} from "../src/LoanToken.sol";

/**
 * @title DeployToMoonbaseAlpha
 * @dev Script for deploying LoanToken contract to Moonbase Alpha
 */
contract DeployToMoonbaseAlpha is Script {
    function run() external returns (LoanToken) {
        // Load environment variables
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        string memory baseURI = vm.envOr("BASE_URI", string("https://api.loanchain.example/metadata/"));
        
        // Print deployment info
        console.log("=== LoanChain Deployment to Moonbase Alpha ===");
        console.log("Network: Moonbase Alpha (Chain ID: 1287)");
        console.log("Base URI:", baseURI);
        
        // Start broadcasting transactions with the deployer's private key
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy the contract
        console.log("Deploying LoanToken contract...");
        LoanToken loanToken = new LoanToken(baseURI);
        
        // Log the deployment results
        console.log("✅ LoanToken deployed successfully!");
        console.log("Contract address:", address(loanToken));
        
        // Print post-deployment information and instructions
        console.log("\n=== Post-Deployment Steps ===");
        console.log("1. Save the contract address for verification");
        console.log("2. Update the frontend's environment variables with the contract address");
        console.log("3. Verify the contract on Moonscan with:");
        console.log("   forge verify-contract --chain-id 1287 --compiler-version 0.8.24", address(loanToken), "LoanToken", "--watch");
        
        // Stop broadcasting
        vm.stopBroadcast();
        
        return loanToken;
    }
} 