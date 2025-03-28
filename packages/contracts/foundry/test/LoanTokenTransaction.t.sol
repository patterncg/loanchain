// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {LoanToken} from "../src/LoanToken.sol";

contract LoanTokenTransactionTest is Test {
    LoanToken public loanToken;
    
    address public owner;
    address public minter;
    address public borrower;
    
    // Sample metadata URIs
    string constant METADATA_URI = "ipfs://QmSampleTransactionTest";
    string constant BASE_URI = "https://api.loanchain.example/metadata/";
    string constant LOAN_TERMS_HASH = "ipfs://QmLoanTermsHashTransaction";
    
    // Sample loan details
    uint256 constant LOAN_AMOUNT = 1 ether;
    uint256 constant LOAN_DUE_DATE = 1735689600; // 2025-01-01
    
    function setUp() public {
        owner = makeAddr("owner");
        minter = makeAddr("minter");
        borrower = makeAddr("borrower");
        
        // Deploy the contract as owner
        vm.startPrank(owner);
        loanToken = new LoanToken(BASE_URI);
        
        // Grant roles
        loanToken.grantRole(loanToken.MINTER_ROLE(), minter);
        vm.stopPrank();
        
        // Fund addresses
        vm.deal(owner, 10 ether);
        vm.deal(minter, 10 ether);
        vm.deal(borrower, 10 ether);
    }
    
    // Test gas usage for minting a loan token
    function test_GasUsage_Mint() public {
        vm.startPrank(minter);
        
        uint256 gasBefore = gasleft();
        loanToken.mintLoanToken(borrower, METADATA_URI, LOAN_AMOUNT, LOAN_DUE_DATE, LOAN_TERMS_HASH);
        uint256 gasAfter = gasleft();
        
        uint256 gasUsed = gasBefore - gasAfter;
        console.log("Gas used for minting a loan token:", gasUsed);
        
        // Assert gas usage is within a reasonable range
        // Note: These values may need adjustment based on actual gas usage
        assertGt(gasUsed, 100000);  // Should use at least this much
        assertLt(gasUsed, 350000);  // Should not use more than this
        
        vm.stopPrank();
    }
    
    // Test gas usage for updating loan status
    function test_GasUsage_UpdateStatus() public {
        // Mint a token first
        vm.prank(minter);
        uint256 tokenId = loanToken.mintLoanToken(borrower, METADATA_URI, LOAN_AMOUNT, LOAN_DUE_DATE, LOAN_TERMS_HASH);
        
        // We need to use the LOAN_MANAGER_ROLE for this test
        bytes32 loanManagerRole = loanToken.LOAN_MANAGER_ROLE();
        
        // Grant loan manager role to minter for this test
        vm.prank(owner);
        loanToken.grantRole(loanManagerRole, minter);
        
        // Test gas usage for updating status
        vm.startPrank(minter);
        
        uint256 gasBefore = gasleft();
        loanToken.updateLoanStatus(tokenId, LoanToken.LoanStatus.Repaid);
        uint256 gasAfter = gasleft();
        
        uint256 gasUsed = gasBefore - gasAfter;
        console.log("Gas used for updating loan status:", gasUsed);
        
        // Assert gas usage is within a reasonable range
        assertGt(gasUsed, 20000);   // Should use at least this much
        assertLt(gasUsed, 100000);  // Should not use more than this
        
        vm.stopPrank();
    }
    
    // Test multiple transactions within a single block
    function test_MultipleTransactionsInBlock() public {
        vm.startPrank(minter);
        
        // Create 5 tokens in quick succession (same block)
        uint256[] memory tokenIds = new uint256[](5);
        
        for (uint256 i = 0; i < 5; i++) {
            tokenIds[i] = loanToken.mintLoanToken(
                borrower,
                string(abi.encodePacked(METADATA_URI, toString(i))),
                LOAN_AMOUNT,
                LOAN_DUE_DATE,
                LOAN_TERMS_HASH
            );
        }
        
        vm.stopPrank();
        
        // Verify all tokens were minted correctly
        assertEq(loanToken.totalSupply(), 5);
        
        // Verify token ownership
        for (uint256 i = 0; i < 5; i++) {
            assertEq(loanToken.ownerOf(tokenIds[i]), borrower);
        }
    }
    
    // Test transaction reversion and gas consumption on failure
    function test_TransactionReversion() public {
        // Try to mint without proper role (should revert)
        vm.startPrank(borrower); // borrower doesn't have minter role
        
        // Measure gas before attempting the transaction
        uint256 gasBefore = gasleft();
        
        // This should revert
        vm.expectRevert();
        loanToken.mintLoanToken(borrower, METADATA_URI, LOAN_AMOUNT, LOAN_DUE_DATE, LOAN_TERMS_HASH);
        
        uint256 gasAfter = gasleft();
        uint256 gasUsed = gasBefore - gasAfter;
        
        console.log("Gas used for reverting transaction:", gasUsed);
        
        vm.stopPrank();
    }
    
    // Test ERC721 token transfers - standard NFT functionality
    function test_TokenTransfers() public {
        // Mint a token to borrower
        vm.prank(minter);
        uint256 tokenId = loanToken.mintLoanToken(borrower, METADATA_URI, LOAN_AMOUNT, LOAN_DUE_DATE, LOAN_TERMS_HASH);
        
        // Verify initial ownership
        assertEq(loanToken.ownerOf(tokenId), borrower);
        assertEq(loanToken.balanceOf(borrower), 1);
        assertEq(loanToken.balanceOf(minter), 0);
        
        // Transfer from borrower to minter
        vm.startPrank(borrower);
        loanToken.transferFrom(borrower, minter, tokenId);
        vm.stopPrank();
        
        // Verify ownership after transfer
        assertEq(loanToken.ownerOf(tokenId), minter);
        assertEq(loanToken.balanceOf(borrower), 0);
        assertEq(loanToken.balanceOf(minter), 1);
        
        // The token's loan data should remain unchanged after transfer
        LoanToken.LoanMetadata memory metadata = loanToken.getLoanMetadata(tokenId);
        assertEq(metadata.amount, LOAN_AMOUNT);
        assertEq(metadata.dueDate, LOAN_DUE_DATE);
        assertEq(uint256(metadata.status), uint256(LoanToken.LoanStatus.Active));
    }
    
    // Helper function to convert uint to string
    function toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        
        uint256 temp = value;
        uint256 digits;
        
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        
        return string(buffer);
    }
} 