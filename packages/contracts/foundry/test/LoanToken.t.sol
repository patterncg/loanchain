// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {LoanToken} from "../src/LoanToken.sol";

contract LoanTokenTest is Test {
    LoanToken public loanToken;
    
    address public owner;
    address public user1;
    address public user2;
    
    // Sample metadata URIs
    string constant METADATA_URI_1 = "ipfs://QmSample1";
    string constant METADATA_URI_2 = "ipfs://QmSample2";
    string constant BASE_URI = "https://api.loanchain.example/metadata/";
    string constant LOAN_TERMS_HASH_1 = "ipfs://QmLoanTerms1";
    string constant LOAN_TERMS_HASH_2 = "ipfs://QmLoanTerms2";
    
    // Sample loan details
    uint256 constant LOAN_AMOUNT_1 = 1 ether;
    uint256 constant LOAN_AMOUNT_2 = 2 ether;
    uint256 constant LOAN_DUE_DATE_1 = 1672531200; // 2023-01-01
    uint256 constant LOAN_DUE_DATE_2 = 1704067200; // 2024-01-01
    
    // Events
    event LoanTokenMinted(uint256 indexed tokenId, address indexed to, address indexed issuer, string metadataURI);
    event LoanStatusUpdated(uint256 indexed tokenId, LoanToken.LoanStatus previousStatus, LoanToken.LoanStatus newStatus);
    event MetadataUpdated(uint256 indexed tokenId, string previousURI, string newURI);
    
    function setUp() public {
        owner = makeAddr("owner");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        
        // Deploy the contract as owner
        vm.startPrank(owner);
        loanToken = new LoanToken(BASE_URI);
        
        // Grant roles
        bytes32 minterRole = loanToken.MINTER_ROLE();
        bytes32 loanManagerRole = loanToken.LOAN_MANAGER_ROLE();
        
        loanToken.grantRole(minterRole, user1);
        loanToken.grantRole(loanManagerRole, user2);
        
        vm.stopPrank();
    }
    
    function test_Initialization() public {
        assertEq(loanToken.name(), "LoanToken");
        assertEq(loanToken.symbol(), "LOAN");
        assertEq(loanToken.owner(), owner);
        assertEq(loanToken.totalSupply(), 0);
        
        // Check role assignments
        assertTrue(loanToken.hasRole(loanToken.DEFAULT_ADMIN_ROLE(), owner));
        assertTrue(loanToken.hasRole(loanToken.MINTER_ROLE(), owner));
        assertTrue(loanToken.hasRole(loanToken.MINTER_ROLE(), user1));
        assertTrue(loanToken.hasRole(loanToken.LOAN_MANAGER_ROLE(), owner));
        assertTrue(loanToken.hasRole(loanToken.LOAN_MANAGER_ROLE(), user2));
    }
    
    function test_MintLoanToken() public {
        vm.prank(user1);
        
        // Expect the LoanTokenMinted event to be emitted
        vm.expectEmit(true, true, true, true);
        emit LoanTokenMinted(1, user2, user1, METADATA_URI_1);
        
        uint256 tokenId = loanToken.mintLoanToken(user2, METADATA_URI_1, LOAN_AMOUNT_1, LOAN_DUE_DATE_1, LOAN_TERMS_HASH_1);
        
        assertEq(tokenId, 1);
        assertEq(loanToken.totalSupply(), 1);
        assertEq(loanToken.balanceOf(user2), 1);
        assertEq(loanToken.ownerOf(tokenId), user2);
        assertEq(loanToken.tokenURI(tokenId), METADATA_URI_1);
        assertEq(loanToken.getTokenIssuer(tokenId), user1);
        
        // Check loan metadata
        (
            address issuer,
            string memory metadataURI,
            uint256 amount,
            uint256 dueDate,
            LoanToken.LoanStatus status,
            string memory loanTermsHash
        ) = getLoanMetadataFields(tokenId);
        
        assertEq(issuer, user1);
        assertEq(metadataURI, METADATA_URI_1);
        assertEq(amount, LOAN_AMOUNT_1);
        assertEq(dueDate, LOAN_DUE_DATE_1);
        assertEq(uint(status), uint(LoanToken.LoanStatus.Active));
        assertEq(loanTermsHash, LOAN_TERMS_HASH_1);
    }
    
    function test_MintMultipleLoanTokens() public {
        // First token
        vm.prank(user1);
        uint256 tokenId1 = loanToken.mintLoanToken(user2, METADATA_URI_1, LOAN_AMOUNT_1, LOAN_DUE_DATE_1, LOAN_TERMS_HASH_1);
        
        // Second token - user2 needs MINTER_ROLE
        vm.startPrank(owner);
        loanToken.grantRole(loanToken.MINTER_ROLE(), user2);
        vm.stopPrank();
        
        vm.prank(user2);
        uint256 tokenId2 = loanToken.mintLoanToken(user1, METADATA_URI_2, LOAN_AMOUNT_2, LOAN_DUE_DATE_2, LOAN_TERMS_HASH_2);
        
        assertEq(loanToken.totalSupply(), 2);
        assertEq(loanToken.balanceOf(user2), 1);
        assertEq(loanToken.balanceOf(user1), 1);
        
        assertEq(loanToken.ownerOf(tokenId1), user2);
        assertEq(loanToken.ownerOf(tokenId2), user1);
        
        assertEq(loanToken.tokenURI(tokenId1), METADATA_URI_1);
        assertEq(loanToken.tokenURI(tokenId2), METADATA_URI_2);
        
        assertEq(loanToken.getTokenIssuer(tokenId1), user1);
        assertEq(loanToken.getTokenIssuer(tokenId2), user2);
        
        // Check loan metadata for token 1
        (
            ,
            ,
            uint256 amount1,
            uint256 dueDate1,
            LoanToken.LoanStatus status1,
            string memory loanTermsHash1
        ) = getLoanMetadataFields(tokenId1);
        
        assertEq(amount1, LOAN_AMOUNT_1);
        assertEq(dueDate1, LOAN_DUE_DATE_1);
        assertEq(uint(status1), uint(LoanToken.LoanStatus.Active));
        assertEq(loanTermsHash1, LOAN_TERMS_HASH_1);
        
        // Check loan metadata for token 2
        (
            ,
            ,
            uint256 amount2,
            uint256 dueDate2,
            LoanToken.LoanStatus status2,
            string memory loanTermsHash2
        ) = getLoanMetadataFields(tokenId2);
        
        assertEq(amount2, LOAN_AMOUNT_2);
        assertEq(dueDate2, LOAN_DUE_DATE_2);
        assertEq(uint(status2), uint(LoanToken.LoanStatus.Active));
        assertEq(loanTermsHash2, LOAN_TERMS_HASH_2);
    }
    
    function test_GetAllLoanTokens() public {
        // Mint a few tokens
        vm.startPrank(user1);
        uint256 tokenId1 = loanToken.mintLoanToken(user1, METADATA_URI_1, LOAN_AMOUNT_1, LOAN_DUE_DATE_1, LOAN_TERMS_HASH_1);
        uint256 tokenId2 = loanToken.mintLoanToken(user2, METADATA_URI_2, LOAN_AMOUNT_2, LOAN_DUE_DATE_2, LOAN_TERMS_HASH_2);
        vm.stopPrank();
        
        // Test getAllLoanTokens
        uint256[] memory allTokens = loanToken.getAllLoanTokens();
        
        assertEq(allTokens.length, 2);
        // Note: This assumes the tokens are returned in order of creation
        assertEq(allTokens[0], tokenId1);
        assertEq(allTokens[1], tokenId2);
    }
    
    function test_GetLoanTokensByOwner() public {
        // Mint multiple tokens to different owners
        vm.prank(user1);
        loanToken.mintLoanToken(user1, METADATA_URI_1, LOAN_AMOUNT_1, LOAN_DUE_DATE_1, LOAN_TERMS_HASH_1);
        
        vm.prank(user1);
        loanToken.mintLoanToken(user2, METADATA_URI_2, LOAN_AMOUNT_2, LOAN_DUE_DATE_2, LOAN_TERMS_HASH_2);
        
        // Grant user2 the MINTER_ROLE
        vm.startPrank(owner);
        loanToken.grantRole(loanToken.MINTER_ROLE(), user2);
        vm.stopPrank();
        
        vm.prank(user2);
        loanToken.mintLoanToken(user1, METADATA_URI_1, LOAN_AMOUNT_1, LOAN_DUE_DATE_1, LOAN_TERMS_HASH_1);
        
        // Check user1's tokens
        uint256[] memory user1Tokens = loanToken.getLoanTokensByOwner(user1);
        assertEq(user1Tokens.length, 2);
        
        // Check user2's tokens
        uint256[] memory user2Tokens = loanToken.getLoanTokensByOwner(user2);
        assertEq(user2Tokens.length, 1);
    }
    
    function test_UpdateLoanStatus() public {
        // Mint a token
        vm.prank(user1);
        uint256 tokenId = loanToken.mintLoanToken(user2, METADATA_URI_1, LOAN_AMOUNT_1, LOAN_DUE_DATE_1, LOAN_TERMS_HASH_1);
        
        // Update loan status
        vm.prank(user2); // user2 has LOAN_MANAGER_ROLE
        vm.expectEmit(true, true, true, true);
        emit LoanStatusUpdated(tokenId, LoanToken.LoanStatus.Active, LoanToken.LoanStatus.Repaid);
        loanToken.updateLoanStatus(tokenId, LoanToken.LoanStatus.Repaid);
        
        // Check updated status
        (
            ,
            ,
            ,
            ,
            LoanToken.LoanStatus status,
            
        ) = getLoanMetadataFields(tokenId);
        
        assertEq(uint(status), uint(LoanToken.LoanStatus.Repaid));
    }
    
    function test_UpdateMetadataURI() public {
        // Mint a token
        vm.prank(user1);
        uint256 tokenId = loanToken.mintLoanToken(user2, METADATA_URI_1, LOAN_AMOUNT_1, LOAN_DUE_DATE_1, LOAN_TERMS_HASH_1);
        
        string memory newURI = "ipfs://QmUpdated";
        
        // Update metadata URI
        vm.prank(user2); // user2 has LOAN_MANAGER_ROLE
        vm.expectEmit(true, true, true, true);
        emit MetadataUpdated(tokenId, METADATA_URI_1, newURI);
        loanToken.updateMetadataURI(tokenId, newURI);
        
        // Check updated URI
        assertEq(loanToken.tokenURI(tokenId), newURI);
    }
    
    function test_GetActiveLoans() public {
        // Mint 3 tokens
        vm.startPrank(user1);
        uint256 tokenId1 = loanToken.mintLoanToken(user1, METADATA_URI_1, LOAN_AMOUNT_1, LOAN_DUE_DATE_1, LOAN_TERMS_HASH_1);
        uint256 tokenId2 = loanToken.mintLoanToken(user2, METADATA_URI_2, LOAN_AMOUNT_2, LOAN_DUE_DATE_2, LOAN_TERMS_HASH_2);
        uint256 tokenId3 = loanToken.mintLoanToken(user2, METADATA_URI_1, LOAN_AMOUNT_1, LOAN_DUE_DATE_1, LOAN_TERMS_HASH_1);
        vm.stopPrank();
        
        // Update status of one token to Repaid
        vm.prank(user2);
        loanToken.updateLoanStatus(tokenId2, LoanToken.LoanStatus.Repaid);
        
        // Get active loans
        uint256[] memory activeLoans = loanToken.getActiveLoans();
        
        // Should only return the 2 active loans
        assertEq(activeLoans.length, 2);
        
        // Check that the active loans are tokenId1 and tokenId3
        bool foundToken1 = false;
        bool foundToken3 = false;
        
        for (uint256 i = 0; i < activeLoans.length; i++) {
            if (activeLoans[i] == tokenId1) {
                foundToken1 = true;
            } else if (activeLoans[i] == tokenId3) {
                foundToken3 = true;
            }
        }
        
        assertTrue(foundToken1);
        assertTrue(foundToken3);
    }
    
    function test_RevertWhen_QueryingNonExistentToken() public {
        vm.expectRevert();
        loanToken.tokenURI(999);
        
        vm.expectRevert();
        loanToken.getTokenIssuer(999);
    }
    
    function test_RevertWhen_UnauthorizedMinting() public {
        // user2 doesn't have MINTER_ROLE initially
        vm.prank(user2);
        vm.expectRevert();
        loanToken.mintLoanToken(user1, METADATA_URI_1, LOAN_AMOUNT_1, LOAN_DUE_DATE_1, LOAN_TERMS_HASH_1);
    }
    
    function test_RevertWhen_UnauthorizedStatusUpdate() public {
        // Mint a token
        vm.prank(user1);
        uint256 tokenId = loanToken.mintLoanToken(user2, METADATA_URI_1, LOAN_AMOUNT_1, LOAN_DUE_DATE_1, LOAN_TERMS_HASH_1);
        
        // user1 doesn't have LOAN_MANAGER_ROLE
        vm.prank(user1);
        vm.expectRevert();
        loanToken.updateLoanStatus(tokenId, LoanToken.LoanStatus.Repaid);
    }
    
    function test_RevertWhen_UpdatingToSameStatus() public {
        // Mint a token
        vm.prank(user1);
        uint256 tokenId = loanToken.mintLoanToken(user2, METADATA_URI_1, LOAN_AMOUNT_1, LOAN_DUE_DATE_1, LOAN_TERMS_HASH_1);
        
        // Try to update to the same status (Active)
        vm.prank(user2);
        vm.expectRevert("LoanToken: Status is already set");
        loanToken.updateLoanStatus(tokenId, LoanToken.LoanStatus.Active);
    }
    
    function test_RevertWhen_UpdatingToSameMetadataURI() public {
        // Mint a token
        vm.prank(user1);
        uint256 tokenId = loanToken.mintLoanToken(user2, METADATA_URI_1, LOAN_AMOUNT_1, LOAN_DUE_DATE_1, LOAN_TERMS_HASH_1);
        
        // Try to update to the same metadata URI
        vm.prank(user2);
        vm.expectRevert("LoanToken: New URI is the same as current URI");
        loanToken.updateMetadataURI(tokenId, METADATA_URI_1);
    }
    
    // Helper function to unpack the loan metadata struct
    function getLoanMetadataFields(uint256 tokenId) public view returns (
        address issuer,
        string memory metadataURI,
        uint256 amount,
        uint256 dueDate,
        LoanToken.LoanStatus status,
        string memory loanTermsHash
    ) {
        LoanToken.LoanMetadata memory metadata = loanToken.getLoanMetadata(tokenId);
        return (
            metadata.issuer,
            metadata.metadataURI,
            metadata.amount,
            metadata.dueDate,
            metadata.status,
            metadata.loanTermsHash
        );
    }
} 