// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {LoanToken} from "../src/LoanToken.sol";

contract DeployLoanToken is Script {
    function run() external returns (LoanToken) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        string memory baseURI = vm.envOr("BASE_URI", string("https://api.loanchain.example/metadata/"));
        
        vm.startBroadcast(deployerPrivateKey);
        
        LoanToken loanToken = new LoanToken(baseURI);
        
        console.log("LoanToken deployed at:", address(loanToken));
        console.log("Base URI set to:", baseURI);
        
        vm.stopBroadcast();
        
        return loanToken;
    }
} 