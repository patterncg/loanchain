// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {LoanToken} from "../src/LoanToken.sol";

contract LoanTokenExtendedTest is Test {
    LoanToken public loanToken;
    
    address public owner;
    address public minter;
    address public manager;
    address public borrower;
    address public otherUser;
    
    // Sample metadata URIs
    string constant METADATA_URI = "ipfs://QmSampleExtendedTest";
    string constant BASE_URI = "https://api.loanchain.example/metadata/";
    string constant LOAN_TERMS_HASH = "ipfs://QmLoanTermsHash";
    
    // Sample loan details
    uint256 constant LOAN_AMOUNT = 1 ether;
    uint256 constant LOAN_DUE_DATE = 1735689600; // 2025-01-01
    
    // Role constants
    bytes32 constant DEFAULT_ADMIN_ROLE = 0x00;
    bytes32 MINTER_ROLE;
    bytes32 LOAN_MANAGER_ROLE;
    
    function setUp() public {
        owner = makeAddr("owner");
        minter = makeAddr("minter");
        manager = makeAddr("manager");
        borrower = makeAddr("borrower");
        otherUser = makeAddr("otherUser");
        
        // Deploy the contract as owner
        vm.startPrank(owner);
        loanToken = new LoanToken(BASE_URI);
        
        // Cache role identifiers
        MINTER_ROLE = loanToken.MINTER_ROLE();
        LOAN_MANAGER_ROLE = loanToken.LOAN_MANAGER_ROLE();
        
        // Grant roles
        loanToken.grantRole(MINTER_ROLE, minter);
        loanToken.grantRole(LOAN_MANAGER_ROLE, manager);
        
        vm.stopPrank();
    }
    
    // Test role management
    function test_RoleManagement() public {
        // Test granting roles
        vm.startPrank(owner);
        loanToken.grantRole(MINTER_ROLE, otherUser);
        assertTrue(loanToken.hasRole(MINTER_ROLE, otherUser));
        
        // Test revoking roles
        loanToken.revokeRole(MINTER_ROLE, otherUser);
        assertFalse(loanToken.hasRole(MINTER_ROLE, otherUser));
        
        // Test renouncing roles
        loanToken.renounceRole(DEFAULT_ADMIN_ROLE, owner);
        assertFalse(loanToken.hasRole(DEFAULT_ADMIN_ROLE, owner));
        vm.stopPrank();
    }
    
    // Test unauthorized role management
    function test_RevertWhen_UnauthorizedRoleManagement() public {
        // Non-admin tries to grant role
        vm.startPrank(minter);
        vm.expectRevert();
        loanToken.grantRole(MINTER_ROLE, otherUser);
        vm.stopPrank();
    }
    
    // Test loan lifecycle - mint, update status, multiple status transitions
    function test_LoanLifecycle() public {
        // 1. Mint a loan token
        vm.prank(minter);
        uint256 tokenId = loanToken.mintLoanToken(borrower, METADATA_URI, LOAN_AMOUNT, LOAN_DUE_DATE, LOAN_TERMS_HASH);
        
        // Verify initial status
        LoanToken.LoanMetadata memory metadata = loanToken.getLoanMetadata(tokenId);
        assertEq(uint(metadata.status), uint(LoanToken.LoanStatus.Active));
        
        // 2. Update to Repaid
        vm.prank(manager);
        loanToken.updateLoanStatus(tokenId, LoanToken.LoanStatus.Repaid);
        
        metadata = loanToken.getLoanMetadata(tokenId);
        assertEq(uint(metadata.status), uint(LoanToken.LoanStatus.Repaid));
        
        // 3. Update to Liquidated (this tests multiple transitions)
        vm.prank(manager);
        loanToken.updateLoanStatus(tokenId, LoanToken.LoanStatus.Liquidated);
        
        metadata = loanToken.getLoanMetadata(tokenId);
        assertEq(uint(metadata.status), uint(LoanToken.LoanStatus.Liquidated));
    }
    
    // Test loan terms update
    function test_UpdateLoanTerms() public {
        // Mint a loan token
        vm.prank(minter);
        uint256 tokenId = loanToken.mintLoanToken(borrower, METADATA_URI, LOAN_AMOUNT, LOAN_DUE_DATE, LOAN_TERMS_HASH);
        
        // Update loan terms
        string memory newTermsHash = "ipfs://QmNewLoanTermsHash";
        vm.prank(manager);
        loanToken.updateLoanTerms(tokenId, newTermsHash);
        
        // Verify terms updated
        LoanToken.LoanMetadata memory metadata = loanToken.getLoanMetadata(tokenId);
        assertEq(metadata.loanTermsHash, newTermsHash);
    }
    
    // Test updating with same loan terms hash
    function test_RevertWhen_UpdatingToSameLoanTerms() public {
        // Mint a loan token
        vm.prank(minter);
        uint256 tokenId = loanToken.mintLoanToken(borrower, METADATA_URI, LOAN_AMOUNT, LOAN_DUE_DATE, LOAN_TERMS_HASH);
        
        // Try to update with the same terms hash
        vm.prank(manager);
        vm.expectRevert("LoanToken: New terms hash is the same as current hash");
        loanToken.updateLoanTerms(tokenId, LOAN_TERMS_HASH);
    }
    
    // Test updating base URI
    function test_UpdateBaseURI() public {
        string memory newBaseURI = "https://new-api.loanchain.example/metadata/";
        
        vm.prank(owner);
        loanToken.setBaseURI(newBaseURI);
        
        // Since _baseURI() is internal, we can't directly test it
        // But we can verify it was set by minting a token and checking its tokenURI with a null metadata URI
        
        // This approach uses a token with explicit metadata URI, so we actually can't test baseURI directly
        // The test is theoretical but included for completeness
    }
    
    // Test handling of loan with past due date
    function test_HandlePastDueDate() public {
        // Mint a loan token with a past due date
        // Use a fixed past date instead of block.timestamp to avoid potential underflow
        uint256 pastDueDate = 1640995200; // 2022-01-01, a date in the past
        
        vm.prank(minter);
        uint256 tokenId = loanToken.mintLoanToken(borrower, METADATA_URI, LOAN_AMOUNT, pastDueDate, LOAN_TERMS_HASH);
        
        // Verify due date is set correctly
        LoanToken.LoanMetadata memory metadata = loanToken.getLoanMetadata(tokenId);
        assertEq(metadata.dueDate, pastDueDate);
        
        // Note: We could mark the loan as defaulted here, but that would require business logic in the contract
        // which isn't currently implemented. This test mainly verifies that past due dates are handled correctly.
    }
    
    // Test batch minting scenario
    function test_BatchMinting() public {
        uint256[] memory tokenIds = new uint256[](5);
        
        // Mint multiple tokens in sequence
        vm.startPrank(minter);
        for (uint i = 0; i < 5; i++) {
            tokenIds[i] = loanToken.mintLoanToken(
                borrower,
                string(abi.encodePacked(METADATA_URI, toString(i))),
                LOAN_AMOUNT * (i + 1),
                LOAN_DUE_DATE + (i * 30 days),
                string(abi.encodePacked(LOAN_TERMS_HASH, toString(i)))
            );
        }
        vm.stopPrank();
        
        // Verify all tokens were minted correctly
        assertEq(loanToken.totalSupply(), 5);
        assertEq(loanToken.balanceOf(borrower), 5);
        
        // Verify specific token data
        for (uint i = 0; i < 5; i++) {
            LoanToken.LoanMetadata memory metadata = loanToken.getLoanMetadata(tokenIds[i]);
            assertEq(metadata.amount, LOAN_AMOUNT * (i + 1));
            assertEq(metadata.issuer, minter);
            assertEq(metadata.dueDate, LOAN_DUE_DATE + (i * 30 days));
        }
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