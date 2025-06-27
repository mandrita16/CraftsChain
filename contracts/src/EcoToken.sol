// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

/**
 * @title EcoToken
 * @dev ERC20 token representing sustainability credits on CraftChain
 */
contract EcoToken is ERC20, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");
    
    uint256 public maxSupply = 1_000_000_000 * 10**18; // 1 billion tokens
    
    event VerifierStatusChanged(address indexed verifier, bool status);
    event MaxSupplyChanged(uint256 oldMaxSupply, uint256 newMaxSupply);
    
    constructor() ERC20("EcoToken", "ECO") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GOVERNANCE_ROLE, msg.sender);
    }
    
    /**
     * @dev Grant or revoke a verifier's ability to mint tokens
     * @param verifier Address to modify permissions for
     * @param status Boolean indicating if the address can mint tokens
     */
    function setVerifier(address verifier, bool status) external onlyRole(GOVERNANCE_ROLE) {
        if (status) {
            grantRole(MINTER_ROLE, verifier);
        } else {
            revokeRole(MINTER_ROLE, verifier);
        }
        
        emit VerifierStatusChanged(verifier, status);
    }
    
    /**
     * @dev Mint new tokens to an address (only callable by verified minters)
     * @param to Address to receive the tokens
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        require(totalSupply() + amount <= maxSupply, "Exceeds max supply");
        _mint(to, amount);
    }
    
    /**
     * @dev Burn tokens from an address (only callable by authorized burners)
     * @param from Address to burn tokens from
     * @param amount Amount of tokens to burn
     */
    function burn(address from, uint256 amount) external onlyRole(BURNER_ROLE) {
        _burn(from, amount);
    }
    
    /**
     * @dev Change the maximum supply (only callable by governance)
     * @param newMaxSupply New maximum supply cap
     */
    function setMaxSupply(uint256 newMaxSupply) external onlyRole(GOVERNANCE_ROLE) {
        require(newMaxSupply >= totalSupply(), "New max supply below current supply");
        uint256 oldMaxSupply = maxSupply;
        maxSupply = newMaxSupply;
        emit MaxSupplyChanged(oldMaxSupply, newMaxSupply);
    }
}