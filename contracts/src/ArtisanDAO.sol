// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "./EcoToken.sol";
import "./SustainabilityVerifier.sol";

/**
 * @title ArtisanDAO
 * @dev Governance contract for the EcoToken ecosystem
 */
contract ArtisanDAO is AccessControl, ReentrancyGuard {
    
    bytes32 public constant MEMBER_ROLE = keccak256("MEMBER_ROLE");
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");
    
    EcoToken public ecoToken;
    SustainabilityVerifier public verifier;
    
    // Manual counter for proposal IDs
    uint256 private _proposalIdCounter;
    
    struct Proposal {
        uint256 id;
        address proposer;
        string description;
        bytes callData;
        address targetContract;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 startBlock;
        uint256 endBlock;
        bool executed;
        mapping(address => bool) voted;
    }
    
    mapping(uint256 => Proposal) public proposals;
    
    // Configurable parameters
    uint256 public votingPeriod = 3 days;
    uint256 public minimumTokensToPropose = 1000 ether; // 1,000 ECO tokens
    uint256 public executionDelay = 1 days;
    uint256 public quorum = 5000 ether; // 5,000 ECO tokens
    
    event ProposalCreated(
        uint256 indexed proposalId, 
        address indexed proposer, 
        string description,
        address targetContract,
        uint256 startBlock,
        uint256 endBlock
    );
    
    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        bool support,
        uint256 weight
    );
    
    event ProposalExecuted(uint256 indexed proposalId);
    event GovernanceParametersUpdated(
        uint256 votingPeriod,
        uint256 minimumTokensToPropose,
        uint256 executionDelay,
        uint256 quorum
    );
    
    constructor(address _ecoToken) {
        ecoToken = EcoToken(_ecoToken);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GOVERNANCE_ROLE, msg.sender);
        
        // Initialize proposal counter
        _proposalIdCounter = 0;
    }
    
    /**
     * @dev Set the verifier contract address
     * @param _verifier Address of the SustainabilityVerifier contract
     */
    function setVerifier(address _verifier) external onlyRole(GOVERNANCE_ROLE) {
        require(_verifier != address(0), "Zero address not allowed");
        verifier = SustainabilityVerifier(_verifier);
    }
    
    /**
     * @dev Update governance parameters
     * @param _votingPeriod New voting period duration
     * @param _minimumTokensToPropose Minimum token threshold to create proposals
     * @param _executionDelay Time delay before execution of passed proposals
     * @param _quorum Minimum token participation required for valid votes
     */
    function updateGovernanceParameters(
        uint256 _votingPeriod,
        uint256 _minimumTokensToPropose,
        uint256 _executionDelay,
        uint256 _quorum
    ) external onlyRole(GOVERNANCE_ROLE) {
        votingPeriod = _votingPeriod;
        minimumTokensToPropose = _minimumTokensToPropose;
        executionDelay = _executionDelay;
        quorum = _quorum;
        
        emit GovernanceParametersUpdated(
            _votingPeriod,
            _minimumTokensToPropose,
            _executionDelay,
            _quorum
        );
    }
    
    /**
     * @dev Create a new governance proposal
     * @param description Human-readable description of the proposal
     * @param targetContract Contract address to call if proposal passes
     * @param callData Function call data to execute if proposal passes
     */
    function createProposal(
        string calldata description,
        address targetContract,
        bytes calldata callData
    ) external nonReentrant {
        require(targetContract != address(0), "Invalid target contract");
        require(ecoToken.balanceOf(msg.sender) >= minimumTokensToPropose, "Insufficient tokens to propose");
        
        // Manually increment proposal counter
        _proposalIdCounter++;
        uint256 proposalId = _proposalIdCounter;
        
        Proposal storage newProposal = proposals[proposalId];
        newProposal.id = proposalId;
        newProposal.proposer = msg.sender;
        newProposal.description = description;
        newProposal.targetContract = targetContract;
        newProposal.callData = callData;
        newProposal.startBlock = block.timestamp;
        newProposal.endBlock = block.timestamp + votingPeriod;
        
        emit ProposalCreated(
            proposalId,
            msg.sender,
            description,
            targetContract,
            newProposal.startBlock, 
            newProposal.endBlock
        );
    }
    
    /**
     * @dev Cast a vote on a proposal
     * @param proposalId ID of the proposal to vote on
     * @param support Boolean indicating support (true) or opposition (false)
     */
    function castVote(uint256 proposalId, bool support) external nonReentrant {
        Proposal storage proposal = proposals[proposalId];
        
        require(proposal.id != 0, "Proposal doesn't exist");
        require(block.timestamp >= proposal.startBlock, "Voting not started");
        require(block.timestamp <= proposal.endBlock, "Voting ended");
        require(!proposal.voted[msg.sender], "Already voted");
        
        uint256 voteWeight = ecoToken.balanceOf(msg.sender);
        require(voteWeight > 0, "No voting power");
        
        proposal.voted[msg.sender] = true;
        
        if (support) {
            proposal.votesFor += voteWeight;
        } else {
            proposal.votesAgainst += voteWeight;
        }
        
        emit VoteCast(proposalId, msg.sender, support, voteWeight);
    }
    
    /**
     * @dev Execute a proposal that has passed
     * @param proposalId ID of the proposal to execute
     */
    function executeProposal(uint256 proposalId) external nonReentrant {
        Proposal storage proposal = proposals[proposalId];
        
        require(proposal.id != 0, "Proposal doesn't exist");
        require(!proposal.executed, "Already executed");
        require(block.timestamp > proposal.endBlock, "Voting still active");
        require(block.timestamp >= proposal.endBlock + executionDelay, "Execution delay not met");
        
        uint256 totalVotes = proposal.votesFor + proposal.votesAgainst;
        require(totalVotes >= quorum, "Quorum not reached");
        require(proposal.votesFor > proposal.votesAgainst, "Proposal rejected");
        
        proposal.executed = true;
        
        // Execute the proposal
        (bool success, ) = proposal.targetContract.call(proposal.callData);
        require(success, "Proposal execution failed");
        
        emit ProposalExecuted(proposalId);
    }
    
    /**
     * @dev Grant verifier role to a trusted party
     * @param account Address to grant verifier role to
     */
    function grantVerifierRole(address account) external onlyRole(GOVERNANCE_ROLE) {
        verifier.grantRole(verifier.VERIFIER_ROLE(), account);
    }
    
    /**
     * @dev Revoke verifier role from an address
     * @param account Address to revoke verifier role from
     */
    function revokeVerifierRole(address account) external onlyRole(GOVERNANCE_ROLE) {
        verifier.revokeRole(verifier.VERIFIER_ROLE(), account);
    }
    
    /**
     * @dev Join the DAO as a member (requires holding ECO tokens)
     */
    function joinDAO() external {
        require(ecoToken.balanceOf(msg.sender) > 0, "Must hold ECO tokens");
        grantRole(MEMBER_ROLE, msg.sender);
    }
    
    /**
     * @dev Leave the DAO
     */
    function leaveDAO() external {
        revokeRole(MEMBER_ROLE, msg.sender);
    }
}