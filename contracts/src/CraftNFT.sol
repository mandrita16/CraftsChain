// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

interface IArtisanSBT {
    function isVerifiedArtisan(address artisan) external view returns (bool);
    function getArtisanData(address artisan) external view returns (string memory name, string memory location, string memory craftType);
}

/**
 * @title CraftNFT
 * @dev Implementation of ERC721 token representing handcrafted items with provenance data
 */
contract CraftNFT is ERC721URIStorage, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    
    // Using a simple uint256 counter instead of Counters
    uint256 private _currentTokenId;
    
    // Address of the ArtisanSBT contract
    address public artisanSBTAddress;
    
    // Provenance structure for supply chain tracking
    struct Provenance {
        string stage;      // e.g., "Created", "Packaged", "Sold"
        address actor;     // Who performed this action
        uint256 timestamp; // When it happened
        string location;   // Where it happened
    }
    
    // Mapping from token ID to array of provenance entries
    mapping(uint256 => Provenance[]) public provenanceHistory;
    
    // Mapping from token ID to artisan address
    mapping(uint256 => address) public craftArtisan;
    
    // Mapping from token ID to eco-friendly status
    mapping(uint256 => bool) public isEcoFriendly;
    
    // Events
    event ProvenanceAdded(uint256 indexed tokenId, string stage, address actor);
    event ArtisanLinked(uint256 indexed tokenId, address indexed artisan);
    event EcoStatusUpdated(uint256 indexed tokenId, bool status);
    
    /**
     * @dev Constructor sets up roles and initializes the contract
     * @param _artisanSBTAddress Address of the ArtisanSBT contract
     */
    constructor(address _artisanSBTAddress) ERC721("CraftChain NFT", "CRAFT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
        artisanSBTAddress = _artisanSBTAddress;
        // Initialize counter to zero (optional, as uint256 defaults to 0)
        _currentTokenId = 0;
    }
    
    /**
     * @dev Modifier to check if caller is a verified artisan
     */
    modifier onlyVerifiedArtisan() {
        require(
            IArtisanSBT(artisanSBTAddress).isVerifiedArtisan(msg.sender),
            "CraftNFT: Caller is not a verified artisan"
        );
        _;
    }
    
    /**
     * @dev Checks if a token exists
     * @param tokenId ID of the token to check
     * @return bool Whether the token exists
     */
    function tokenExists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
    
    /**
     * @dev Mints a new craft NFT
     * @param to Address to mint the token to
     * @param tokenURI URI of the token metadata
     * @param initialStage Initial stage for provenance
     * @param location Current location
     * @param isEco Whether the craft is eco-friendly
     * @return tokenId The ID of the newly minted token
     */
    function mintCraftNFT(
        address to, 
        string memory tokenURI, 
        string memory initialStage,
        string memory location,
        bool isEco
    ) 
        public 
        onlyRole(MINTER_ROLE) 
        returns (uint256)
    {
        // Simple counter implementation
        uint256 tokenId = _currentTokenId;
        _currentTokenId += 1;
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        // Add initial provenance data
        Provenance memory initialProvenance = Provenance({
            stage: initialStage,
            actor: msg.sender,
            timestamp: block.timestamp,
            location: location
        });
        
        provenanceHistory[tokenId].push(initialProvenance);
        isEcoFriendly[tokenId] = isEco;
        
        emit ProvenanceAdded(tokenId, initialStage, msg.sender);
        return tokenId;
    }

    /**
     * @dev Adds a new provenance entry to an existing token
     * @param tokenId ID of the token
     * @param stage Current stage in the supply chain
     * @param location Current location
     */
    function addProvenanceEntry(
        uint256 tokenId, 
        string memory stage, 
        string memory location
    ) 
        public 
        onlyRole(VERIFIER_ROLE)
    {
        require(tokenExists(tokenId), "CraftNFT: Provenance query for nonexistent token");
        
        Provenance memory newProvenance = Provenance({
            stage: stage,
            actor: msg.sender,
            timestamp: block.timestamp,
            location: location
        });
        
        provenanceHistory[tokenId].push(newProvenance);
        emit ProvenanceAdded(tokenId, stage, msg.sender);
    }
    
    /**
     * @dev Links an artisan to a token
     * @param tokenId ID of the token
     * @param artisan Address of the artisan
     */
    function linkToArtisan(uint256 tokenId, address artisan) 
        public 
        onlyRole(VERIFIER_ROLE) 
    {
        require(tokenExists(tokenId), "CraftNFT: Link query for nonexistent token");
        require(
            IArtisanSBT(artisanSBTAddress).isVerifiedArtisan(artisan),
            "CraftNFT: Address is not a verified artisan"
        );
        
        craftArtisan[tokenId] = artisan;
        emit ArtisanLinked(tokenId, artisan);
    }
    
    /**
     * @dev Set provenance data in bulk
     * @param tokenId ID of the token
     * @param stages Array of provenance entries
     */
    function setProvenanceData(uint256 tokenId, Provenance[] calldata stages) 
        external 
        onlyRole(VERIFIER_ROLE) 
    {
        require(tokenExists(tokenId), "CraftNFT: Provenance query for nonexistent token");
        
        // Clear existing provenance and add new entries
        delete provenanceHistory[tokenId];
        for (uint i = 0; i < stages.length; i++) {
            provenanceHistory[tokenId].push(stages[i]);
            emit ProvenanceAdded(tokenId, stages[i].stage, stages[i].actor);
        }
    }
    
    /**
     * @dev Updates the eco-friendly status of a craft item
     * @param tokenId ID of the token
     * @param status New eco-friendly status
     */
    function setEcoStatus(uint256 tokenId, bool status) 
        external 
        onlyRole(VERIFIER_ROLE) 
    {
        require(tokenExists(tokenId), "CraftNFT: Eco status query for nonexistent token");
        isEcoFriendly[tokenId] = status;
        emit EcoStatusUpdated(tokenId, status);
    }
    
    /**
     * @dev Retrieves complete provenance history for a token
     * @param tokenId ID of the token
     * @return Array of provenance entries
     */
    function getProvenanceHistory(uint256 tokenId) 
        external 
        view 
        returns (Provenance[] memory) 
    {
        require(tokenExists(tokenId), "CraftNFT: Provenance query for nonexistent token");
        return provenanceHistory[tokenId];
    }
    
    /**
     * @dev Retrieves artisan data for a specific token
     * @param tokenId ID of the token
     * @return name Artisan name
     * @return location Artisan location
     * @return craftType Type of craft
     */
    function getArtisanData(uint256 tokenId) 
        external 
        view 
        returns (string memory name, string memory location, string memory craftType) 
    {
        require(tokenExists(tokenId), "CraftNFT: Artisan query for nonexistent token");
        address artisan = craftArtisan[tokenId];
        require(artisan != address(0), "CraftNFT: No artisan linked to this token");
        
        return IArtisanSBT(artisanSBTAddress).getArtisanData(artisan);
    }
    
    /**
     * @dev Override supportsInterface to support both ERC721 and AccessControl
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    
    /**
     * @dev Get the current token ID (useful for frontend integration)
     * @return The current token ID counter value
     */
    function getCurrentTokenId() public view returns (uint256) {
        return _currentTokenId;
    }
}