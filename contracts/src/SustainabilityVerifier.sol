// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "./EcoToken.sol";

/**
 * @title SustainabilityVerifier
 * @dev Handles verification of eco-friendly practices and rewards artisans
 */
contract SustainabilityVerifier is AccessControl, ReentrancyGuard {
    using Math for uint256;
    
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");
    
    EcoToken public ecoToken;
    address public dao;
    
    // Manual counter for verification IDs
    uint256 private _currentVerificationId = 0;
    
    struct Verification {
        uint256 id;
        address artisan;
        address verifier;
        uint8 sustainabilityScore;
        uint256 tokensIssued;
        string evidenceHash; // IPFS hash of evidence
        uint256 timestamp;
        bool disputed;
    }
    
    mapping(uint256 => Verification) public verifications;
    mapping(address => uint256[]) public artisanVerifications;
    mapping(address => uint256) public lastVerifiedBlock;
    
    // Configurable parameters
    uint256 public minVerificationInterval = 1 days; // Minimum time between verifications
    uint256 public baseRewardPerPoint = 0.5 ether; // 0.5 ECO per sustainability point
    uint256 public disputeWindow = 7 days; // Time window for disputes
    
    event EcoVerified(
        uint256 indexed verificationId,
        address indexed artisan,
        address indexed verifier,
        uint8 sustainabilityScore,
        uint256 tokensIssued,
        string evidenceHash
    );
    
    event VerificationDisputed(
        uint256 indexed verificationId,
        address indexed whistleblower
    );
    
    event VerificationParametersUpdated(
        uint256 minVerificationInterval,
        uint256 baseRewardPerPoint,
        uint256 disputeWindow
    );
    
    modifier onlyDAO() {
        require(msg.sender == dao, "Caller is not the DAO");
        _;
    }
    
    constructor(address _ecoToken, address _initialDAO) {
        ecoToken = EcoToken(_ecoToken);
        dao = _initialDAO;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GOVERNANCE_ROLE, msg.sender);
        _grantRole(GOVERNANCE_ROLE, _initialDAO);
    }
    
    /**
     * @dev Set the DAO address
     * @param _dao Address of the ArtisanDAO contract
     */
    function setDAO(address _dao) external onlyRole(GOVERNANCE_ROLE) {
        require(_dao != address(0), "Zero address not allowed");
        dao = _dao;
        
        // Grant governance role to new DAO
        grantRole(GOVERNANCE_ROLE, _dao);
    }
    
    /**
     * @dev Update verification parameters
     * @param _minVerificationInterval Minimum time between verifications
     * @param _baseRewardPerPoint Base reward per sustainability point
     * @param _disputeWindow Time window for disputes
     */
    function updateVerificationParameters(
        uint256 _minVerificationInterval,
        uint256 _baseRewardPerPoint,
        uint256 _disputeWindow
    ) external onlyRole(GOVERNANCE_ROLE) {
        minVerificationInterval = _minVerificationInterval;
        baseRewardPerPoint = _baseRewardPerPoint;
        disputeWindow = _disputeWindow;
        
        emit VerificationParametersUpdated(
            _minVerificationInterval,
            _baseRewardPerPoint,
            _disputeWindow
        );
    }
    
    /**
     * @dev Verify an artisan's sustainable practices and reward them
     * @param artisan Address of the artisan being verified
     * @param sustainabilityScore Score representing eco-friendliness (0-100)
     * @param evidenceHash IPFS hash pointing to verification evidence
     */
    function verifyAndReward(
        address artisan,
        uint8 sustainabilityScore,
        string calldata evidenceHash
    ) external onlyRole(VERIFIER_ROLE) nonReentrant {
        require(artisan != address(0), "Invalid artisan address");
        require(sustainabilityScore <= 100, "Score must be 0-100");
        require(bytes(evidenceHash).length > 0, "Evidence hash required");
        require(
            block.timestamp >= lastVerifiedBlock[artisan] + minVerificationInterval,
            "Verification too soon"
        );
        
        // Calculate reward amount based on sustainability score
        uint256 rewardAmount = uint256(sustainabilityScore) * baseRewardPerPoint;
        
        // Mint tokens to the artisan
        ecoToken.mint(artisan, rewardAmount);
        
        // Update the last verified block
        lastVerifiedBlock[artisan] = block.timestamp;
        
        // Create verification record - manually increment the ID
        _currentVerificationId += 1;
        uint256 newVerificationId = _currentVerificationId;
        
        verifications[newVerificationId] = Verification({
            id: newVerificationId,
            artisan: artisan,
            verifier: msg.sender,
            sustainabilityScore: sustainabilityScore,
            tokensIssued: rewardAmount,
            evidenceHash: evidenceHash,
            timestamp: block.timestamp,
            disputed: false
        });
        
        // Add to artisan's verification list
        artisanVerifications[artisan].push(newVerificationId);
        
        emit EcoVerified(
            newVerificationId,
            artisan,
            msg.sender,
            sustainabilityScore,
            rewardAmount,
            evidenceHash
        );
    }
    
    /**
     * @dev Dispute a verification if fraudulent activity is suspected
     * @param verificationId ID of the verification to dispute
     */
    function disputeVerification(uint256 verificationId) external {
        Verification storage verification = verifications[verificationId];
        
        require(verification.id != 0, "Verification doesn't exist");
        require(!verification.disputed, "Already disputed");
        require(
            block.timestamp <= verification.timestamp + disputeWindow,
            "Dispute window closed"
        );
        
        verification.disputed = true;
        
        emit VerificationDisputed(verificationId, msg.sender);
    }
    
    /**
     * @dev Resolve a disputed verification
     * @param verificationId ID of the disputed verification
     * @param uphold Whether to uphold or reject the dispute
     */
    function resolveDispute(uint256 verificationId, bool uphold) external onlyDAO {
        Verification storage verification = verifications[verificationId];
        
        require(verification.id != 0, "Verification doesn't exist");
        require(verification.disputed, "Not disputed");
        
        if (uphold) {
            // Dispute is valid, burn the tokens from the artisan
            ecoToken.burn(verification.artisan, verification.tokensIssued);
            
            // Consider adding penalties for verifier here
        }
        
        // Reset dispute status
        verification.disputed = false;
    }
    
    /**
     * @dev Get all verification IDs for an artisan
     * @param artisan Address of the artisan
     * @return Array of verification IDs
     */
    function getArtisanVerifications(address artisan) external view returns (uint256[] memory) {
        return artisanVerifications[artisan];
    }
    
    /**
     * @dev Get verification batch data
     * @param fromId Starting verification ID
     * @param count Number of verifications to retrieve
     * @return Array of verification data
     */
    function getVerificationBatch(uint256 fromId, uint256 count) external view returns (Verification[] memory) {
        uint256 currentId = _currentVerificationId;
        if (fromId == 0) fromId = 1;
        
        if (fromId > currentId) {
            return new Verification[](0);
        }
        
        if (fromId + count - 1 > currentId) {
            count = currentId - fromId + 1;
        }
        
        Verification[] memory batch = new Verification[](count);
        
        for (uint256 i = 0; i < count; i++) {
            batch[i] = verifications[fromId + i];
        }
        
        return batch;
    }
    
    /**
     * @dev Get the current verification ID counter value
     * @return Current verification ID
     */
    function getCurrentVerificationId() external view returns (uint256) {
        return _currentVerificationId;
    }
}