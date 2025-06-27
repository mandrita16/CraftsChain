// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title SoulBoundArtisanID
 * @dev Implementation of the EIP-4973 Account-bound Token standard for Artisan verification
 */
contract SoulBoundArtisanID is Ownable {
    using Strings for uint256;
    
    // Events
    event Attest(address indexed to, uint256 indexed tokenId);
    event Revoke(address indexed to, uint256 indexed tokenId);
    event MetadataUpdate(uint256 indexed tokenId);
    
    // Authorized verifiers
    mapping(address => bool) public verifiers;
    
    // Token data
    uint256 private _tokenIdCounter;
    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    mapping(uint256 => TokenMetadata) private _tokenMetadata;
    
    // Artisan metadata structure
    struct TokenMetadata {
        string fullName;
        string craftType;
        string region;
        string verificationId;
        address verifier;
        uint256 issuedAt;
        bool active;
    }
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Adds a new authorized verifier
     */
    function addVerifier(address verifier) external onlyOwner {
        verifiers[verifier] = true;
    }
    
    /**
     * @dev Removes an authorized verifier
     */
    function removeVerifier(address verifier) external onlyOwner {
        verifiers[verifier] = false;
    }
    
    /**
     * @dev Mints a new SBT to an artisan
     */
    function mint(
        address to,
        string memory fullName,
        string memory craftType,
        string memory region,
        string memory verificationId
    ) external returns (uint256) {
        require(verifiers[msg.sender] || owner() == msg.sender, "Not authorized to mint");
        require(_balances[to] == 0, "Artisan already has an SBT");
        require(to != address(0), "Cannot mint to zero address");
        
        uint256 tokenId = _tokenIdCounter++;
        _owners[tokenId] = to;
        _balances[to] += 1;
        
        // Store metadata
        _tokenMetadata[tokenId] = TokenMetadata({
            fullName: fullName,
            craftType: craftType,
            region: region,
            verificationId: verificationId,
            verifier: msg.sender,
            issuedAt: block.timestamp,
            active: true
        });
        
        emit Attest(to, tokenId);
        return tokenId;
    }
    
    /**
     * @dev Revokes an SBT (doesn't remove ownership, just marks as inactive)
     */
    function revoke(uint256 tokenId) external {
        address owner = _owners[tokenId];
        require(owner != address(0), "Token does not exist");
        require(verifiers[msg.sender] || Ownable.owner() == msg.sender, "Not authorized to revoke");
        
        _tokenMetadata[tokenId].active = false;
        emit Revoke(owner, tokenId);
    }
    
    /**
     * @dev Updates an SBT's metadata
     */
    function updateMetadata(
        uint256 tokenId,
        string memory fullName,
        string memory craftType,
        string memory region,
        string memory verificationId
    ) external {
        require(_owners[tokenId] != address(0), "Token does not exist");
        require(verifiers[msg.sender] || Ownable.owner() == msg.sender, "Not authorized to update");
        
        TokenMetadata storage metadata = _tokenMetadata[tokenId];
        metadata.fullName = fullName;
        metadata.craftType = craftType;
        metadata.region = region;
        metadata.verificationId = verificationId;
        
        emit MetadataUpdate(tokenId);
    }
    
    /**
     * @dev Reactivates a previously revoked SBT
     */
    function reactivate(uint256 tokenId) external {
        require(_owners[tokenId] != address(0), "Token does not exist");
        require(verifiers[msg.sender] || Ownable.owner() == msg.sender, "Not authorized");
        require(!_tokenMetadata[tokenId].active, "Token is already active");
        
        _tokenMetadata[tokenId].active = true;
        emit Attest(_owners[tokenId], tokenId);
    }
    
    /**
     * @dev Prevent transfers - SBTs cannot be transferred
     */
    function transfer(address, uint256) external pure {
        revert("SBTs cannot be transferred");
    }
    
    // View functions
    
    /**
     * @dev Returns the token metadata
     */
    function getTokenMetadata(uint256 tokenId) external view returns (
        string memory fullName,
        string memory craftType,
        string memory region,
        string memory verificationId,
        address verifier,
        uint256 issuedAt,
        bool active
    ) {
        require(_owners[tokenId] != address(0), "Token does not exist");
        TokenMetadata memory metadata = _tokenMetadata[tokenId];
        
        return (
            metadata.fullName,
            metadata.craftType,
            metadata.region,
            metadata.verificationId,
            metadata.verifier,
            metadata.issuedAt,
            metadata.active
        );
    }
    
    /**
     * @dev Returns the owner of a token
     */
    function ownerOf(uint256 tokenId) external view returns (address) {
        address owner = _owners[tokenId];
        require(owner != address(0), "Token does not exist");
        return owner;
    }
    
    /**
     * @dev Returns the balance of an address
     */
    function balanceOf(address owner) external view returns (uint256) {
        return _balances[owner];
    }
    
    /**
     * @dev Returns the token ID owned by an address
     */
    function tokenOfOwner(address owner) external view returns (uint256) {
        require(_balances[owner] > 0, "Address has no token");
        
        // Search for the token owned by this address
        for (uint256 i = 0; i < _tokenIdCounter; i++) {
            if (_owners[i] == owner) {
                return i;
            }
        }
        
        revert("Token not found");
    }
    
    /**
     * @dev Returns true if the token is active
     */
    function isActive(uint256 tokenId) external view returns (bool) {
        require(_owners[tokenId] != address(0), "Token does not exist");
        return _tokenMetadata[tokenId].active;
    }
    
    /**
     * @dev Returns the total number of tokens minted
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }
    
    /**
     * @dev Checks if an address is an authorized verifier
     */
    function isVerifier(address verifier) external view returns (bool) {
        return verifiers[verifier];
    }
}