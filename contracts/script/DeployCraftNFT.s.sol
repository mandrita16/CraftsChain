// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/CraftNFT.sol";
import "../src/SoulBoundArtisanID.sol";

/**
 * @title DeployCraftNFT
 * @dev Script to deploy the CraftNFT contract
 * Usage: forge script script/DeployCraftNFT.s.sol:DeployCraftNFT --rpc-url <your_rpc_url> --private-key <your_private_key> --broadcast
 */
contract DeployCraftNFT is Script {
    address public constant EXISTING_ARTISAN_SBT = 0xa71dbeE2B0094ea44eF5D08A290663d3eE06FE71;

    function run() public {
        // Start broadcasting transactions
        vm.startBroadcast();
        
        // Deploy ArtisanSBT first if needed
        address artisanSBTAddress;
        if (EXISTING_ARTISAN_SBT == address(0)) {
            // Deploy new ArtisanSBT - adjust constructor parameters as needed
            SoulBoundArtisanID artisanSBT = new SoulBoundArtisanID();
            artisanSBTAddress = address(artisanSBT);
            console.log("ArtisanSBT deployed at:", artisanSBTAddress);
        } else {
            // Use existing ArtisanSBT
            artisanSBTAddress = EXISTING_ARTISAN_SBT;
            console.log("Using existing ArtisanSBT at:", artisanSBTAddress);
        }
        
        // Deploy CraftNFT with ArtisanSBT address
        CraftNFT craftNFT = new CraftNFT(artisanSBTAddress);
        address craftNFTAddress = address(craftNFT);
        
        // Grant MINTER_ROLE and VERIFIER_ROLE to the deployer (optional)
        // These are already granted in the constructor, so this is redundant
        // but included for demonstration
        bytes32 minterRole = craftNFT.MINTER_ROLE();
        bytes32 verifierRole = craftNFT.VERIFIER_ROLE();
        
        // Stop broadcasting transactions
        vm.stopBroadcast();
        
        // Log deployment information
        console.log("CraftNFT deployed at:", craftNFTAddress);
        console.log("MINTER_ROLE:", uint256(minterRole));
        console.log("VERIFIER_ROLE:", uint256(verifierRole));
    }
}