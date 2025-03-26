// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title LoanToken
 * @dev ERC-721 contract for loan tokens with extended loan functionality
 */
contract LoanToken is ERC721Enumerable, Ownable, AccessControl {
    using Strings for uint256;
    
    // Role definitions
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant LOAN_MANAGER_ROLE = keccak256("LOAN_MANAGER_ROLE");
    
    // Enum for loan status
    enum LoanStatus {
        Active,
        Repaid,
        Defaulted,
        Liquidated,
        Cancelled
    }
    
    struct LoanMetadata {
        address issuer;         // Address that issued this loan token
        string metadataURI;     // URI pointing to the metadata for this token
        uint256 amount;         // Loan amount in smallest unit (e.g. wei)
        uint256 dueDate;        // Timestamp when the loan is due
        LoanStatus status;      // Current status of the loan
        string loanTermsHash;   // IPFS hash to the loan terms document
    }
    
    // Base URI for the contract's metadata
    string private _baseTokenURI;
    
    // Mapping from token ID to loan metadata
    mapping(uint256 => LoanMetadata) private _loanMetadata;
    
    // Events
    event LoanTokenMinted(uint256 indexed tokenId, address indexed to, address indexed issuer, string metadataURI);
    event LoanStatusUpdated(uint256 indexed tokenId, LoanStatus previousStatus, LoanStatus newStatus);
    event MetadataUpdated(uint256 indexed tokenId, string previousURI, string newURI);
    event LoanTermsUpdated(uint256 indexed tokenId, string previousTermsHash, string newTermsHash);
    
    /**
     * @dev Constructor initializes the contract with a name and symbol.
     * @param baseURI The base URI for the token metadata
     */
    constructor(string memory baseURI) ERC721("LoanToken", "LOAN") Ownable(msg.sender) {
        _baseTokenURI = baseURI;
        
        // Setup roles
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(LOAN_MANAGER_ROLE, msg.sender);
    }
    
    /**
     * @dev Mints a new loan token to the specified address with metadata.
     * @param to The address that will receive the token
     * @param metadataURI The URI pointing to the token's metadata
     * @param amount The loan amount
     * @param dueDate The timestamp when the loan is due
     * @param loanTermsHash IPFS hash to the loan terms document
     * @return tokenId The ID of the newly minted token
     */
    function mintLoanToken(
        address to, 
        string memory metadataURI, 
        uint256 amount, 
        uint256 dueDate,
        string memory loanTermsHash
    ) public onlyRole(MINTER_ROLE) returns (uint256) {
        uint256 tokenId = totalSupply() + 1;
        
        _mint(to, tokenId);
        
        _loanMetadata[tokenId] = LoanMetadata({
            issuer: msg.sender,
            metadataURI: metadataURI,
            amount: amount,
            dueDate: dueDate,
            status: LoanStatus.Active,
            loanTermsHash: loanTermsHash
        });
        
        emit LoanTokenMinted(tokenId, to, msg.sender, metadataURI);
        
        return tokenId;
    }
    
    /**
     * @dev Updates the status of a loan token.
     * @param tokenId The ID of the token to update
     * @param newStatus The new status of the loan
     */
    function updateLoanStatus(uint256 tokenId, LoanStatus newStatus) 
        public 
        onlyRole(LOAN_MANAGER_ROLE) 
    {
        _requireOwned(tokenId);
        
        LoanStatus previousStatus = _loanMetadata[tokenId].status;
        require(previousStatus != newStatus, "LoanToken: Status is already set");
        
        _loanMetadata[tokenId].status = newStatus;
        
        emit LoanStatusUpdated(tokenId, previousStatus, newStatus);
    }
    
    /**
     * @dev Updates the metadata URI for a loan token.
     * @param tokenId The ID of the token to update
     * @param newMetadataURI The new metadata URI
     */
    function updateMetadataURI(uint256 tokenId, string memory newMetadataURI) 
        public 
        onlyRole(LOAN_MANAGER_ROLE) 
    {
        _requireOwned(tokenId);
        
        string memory previousURI = _loanMetadata[tokenId].metadataURI;
        require(
            keccak256(abi.encodePacked(previousURI)) != keccak256(abi.encodePacked(newMetadataURI)),
            "LoanToken: New URI is the same as current URI"
        );
        
        _loanMetadata[tokenId].metadataURI = newMetadataURI;
        
        emit MetadataUpdated(tokenId, previousURI, newMetadataURI);
    }
    
    /**
     * @dev Updates the loan terms hash for a loan token.
     * @param tokenId The ID of the token to update
     * @param newTermsHash The new loan terms hash
     */
    function updateLoanTerms(uint256 tokenId, string memory newTermsHash) 
        public 
        onlyRole(LOAN_MANAGER_ROLE) 
    {
        _requireOwned(tokenId);
        
        string memory previousTermsHash = _loanMetadata[tokenId].loanTermsHash;
        require(
            keccak256(abi.encodePacked(previousTermsHash)) != keccak256(abi.encodePacked(newTermsHash)),
            "LoanToken: New terms hash is the same as current hash"
        );
        
        _loanMetadata[tokenId].loanTermsHash = newTermsHash;
        
        emit LoanTermsUpdated(tokenId, previousTermsHash, newTermsHash);
    }
    
    /**
     * @dev Returns the metadata URI for a given token ID.
     * @param tokenId The ID of the token
     * @return string The metadata URI of the token
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        
        return _loanMetadata[tokenId].metadataURI;
    }
    
    /**
     * @dev Returns the base URI for the contract's metadata.
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
    
    /**
     * @dev Sets the base URI for the contract's metadata.
     * @param baseURI The new base URI
     */
    function setBaseURI(string memory baseURI) public onlyOwner {
        _baseTokenURI = baseURI;
    }
    
    /**
     * @dev Returns the issuer of a loan token.
     * @param tokenId The ID of the token
     * @return address The address of the token issuer
     */
    function getTokenIssuer(uint256 tokenId) public view returns (address) {
        _requireOwned(tokenId);
        
        return _loanMetadata[tokenId].issuer;
    }
    
    /**
     * @dev Returns all loan tokens minted by this contract.
     * @return An array of all token IDs
     */
    function getAllLoanTokens() public view returns (uint256[] memory) {
        uint256 tokenCount = totalSupply();
        uint256[] memory tokenIds = new uint256[](tokenCount);
        
        for (uint256 i = 0; i < tokenCount; i++) {
            // Use the enumerable function to get token by index
            tokenIds[i] = tokenByIndex(i);
        }
        
        return tokenIds;
    }
    
    /**
     * @dev Returns all loan tokens owned by a specific address.
     * @param owner The address to query tokens for
     * @return An array of token IDs owned by the given address
     */
    function getLoanTokensByOwner(address owner) public view returns (uint256[] memory) {
        uint256 tokenCount = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](tokenCount);
        
        for (uint256 i = 0; i < tokenCount; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(owner, i);
        }
        
        return tokenIds;
    }
    
    /**
     * @dev Returns the loan metadata for a given token ID.
     * @param tokenId The ID of the token
     * @return The loan metadata
     */
    function getLoanMetadata(uint256 tokenId) public view returns (LoanMetadata memory) {
        _requireOwned(tokenId);
        
        return _loanMetadata[tokenId];
    }
    
    /**
     * @dev Returns all active loans.
     * @return An array of token IDs with active loans
     */
    function getActiveLoans() public view returns (uint256[] memory) {
        uint256 tokenCount = totalSupply();
        
        // First pass to count active loans
        uint256 activeCount = 0;
        for (uint256 i = 0; i < tokenCount; i++) {
            uint256 tokenId = tokenByIndex(i);
            if (_loanMetadata[tokenId].status == LoanStatus.Active) {
                activeCount++;
            }
        }
        
        // Second pass to populate array
        uint256[] memory activeLoans = new uint256[](activeCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < tokenCount; i++) {
            uint256 tokenId = tokenByIndex(i);
            if (_loanMetadata[tokenId].status == LoanStatus.Active) {
                activeLoans[currentIndex] = tokenId;
                currentIndex++;
            }
        }
        
        return activeLoans;
    }
    
    /**
     * @dev Check if this contract implements the requested interface.
     * @param interfaceId The interface identifier
     * @return bool Whether the contract implements the interface
     */
    function supportsInterface(bytes4 interfaceId) 
        public 
        view 
        override(ERC721Enumerable, AccessControl) 
        returns (bool) 
    {
        return super.supportsInterface(interfaceId);
    }
} 