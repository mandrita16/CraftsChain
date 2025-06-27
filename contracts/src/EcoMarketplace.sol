// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "./EcoToken.sol";
import "./SustainabilityVerifier.sol";
import "./ArtisanDAO.sol";

/**
 * @title EcoMarketplace
 * @dev Marketplace functionality for redeeming EcoTokens
 */
contract EcoMarketplace is AccessControl, ReentrancyGuard {
    bytes32 public constant MARKETPLACE_ADMIN_ROLE = keccak256("MARKETPLACE_ADMIN_ROLE");
    
    EcoToken public ecoToken;
    ArtisanDAO public dao;
    
    struct Reward {
        uint256 id;
        string name;
        string description;
        uint256 ecoCost;
        bool active;
    }
    
    mapping(uint256 => Reward) public rewards;
    uint256 public nextRewardId = 1;
    
    event RewardAdded(uint256 indexed id, string name, uint256 ecoCost);
    event RewardUpdated(uint256 indexed id, string name, uint256 ecoCost, bool active);
    event RewardRedeemed(uint256 indexed id, address indexed redeemer, uint256 ecoCost);
    
    constructor(address _ecoToken, address _dao) {
        ecoToken = EcoToken(_ecoToken);
        dao = ArtisanDAO(_dao);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MARKETPLACE_ADMIN_ROLE, msg.sender);
        _grantRole(MARKETPLACE_ADMIN_ROLE, _dao);
    }
    
    /**
     * @dev Add a new reward to the marketplace
     * @param name Name of the reward
     * @param description Description of the reward
     * @param ecoCost Cost in EcoTokens
     */
    function addReward(
        string calldata name,
        string calldata description,
        uint256 ecoCost
    ) external onlyRole(MARKETPLACE_ADMIN_ROLE) {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(ecoCost > 0, "Cost must be positive");
        
        uint256 rewardId = nextRewardId;
        nextRewardId++;
        
        rewards[rewardId] = Reward({
            id: rewardId,
            name: name,
            description: description,
            ecoCost: ecoCost,
            active: true
        });
        
        emit RewardAdded(rewardId, name, ecoCost);
    }
    
    /**
     * @dev Update an existing reward
     * @param rewardId ID of the reward to update
     * @param name New name
     * @param description New description
     * @param ecoCost New cost in EcoTokens
     * @param active Whether the reward is active
     */
    function updateReward(
        uint256 rewardId,
        string calldata name,
        string calldata description,
        uint256 ecoCost,
        bool active
    ) external onlyRole(MARKETPLACE_ADMIN_ROLE) {
        require(rewards[rewardId].id != 0, "Reward doesn't exist");
        require(bytes(name).length > 0, "Name cannot be empty");
        require(ecoCost > 0, "Cost must be positive");
        
        Reward storage reward = rewards[rewardId];
        reward.name = name;
        reward.description = description;
        reward.ecoCost = ecoCost;
        reward.active = active;
        
        emit RewardUpdated(rewardId, name, ecoCost, active);
    }
    
    /**
     * @dev Redeem a reward using EcoTokens
     * @param rewardId ID of the reward to redeem
     */
    function redeemReward(uint256 rewardId) external nonReentrant {
        Reward storage reward = rewards[rewardId];
        
        require(reward.id != 0, "Reward doesn't exist");
        require(reward.active, "Reward not active");
        
        uint256 cost = reward.ecoCost;
        require(ecoToken.balanceOf(msg.sender) >= cost, "Insufficient EcoTokens");
        
        // Burn the tokens from the user
        ecoToken.burn(msg.sender, cost);
        
        // Log the redemption
        emit RewardRedeemed(rewardId, msg.sender, cost);
        
        // Implementation of actual reward delivery would happen off-chain
        // by monitoring this event
    }
    
    /**
     * @dev Get all rewards (active only)
     * @return Array of active rewards
     */
    function getActiveRewards() external view returns (Reward[] memory) {
        uint256 activeCount = 0;
        
        // Count active rewards
        for (uint256 i = 1; i < nextRewardId; i++) {
            if (rewards[i].active) {
                activeCount++;
            }
        }
        
        // Create result array
        Reward[] memory activeRewards = new Reward[](activeCount);
        uint256 currentIndex = 0;
        
        // Fill result array
        for (uint256 i = 1; i < nextRewardId; i++) {
            if (rewards[i].active) {
                activeRewards[currentIndex] = rewards[i];
                currentIndex++;
            }
        }
        
        return activeRewards;
    }
}