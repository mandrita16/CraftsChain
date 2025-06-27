// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/SoulBoundArtisanID.sol";

contract DeploySoulBoundArtisanID is Script {
    function run() external {
        // Retrieve private key from environment variable for deployment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address initialVerifier = vm.envAddress("INITIAL_VERIFIER");
        
        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy the SoulBoundArtisanID contract
        SoulBoundArtisanID soulBoundArtisanID = new SoulBoundArtisanID();
        
        // Add an initial verifier if specified
        if (initialVerifier != address(0)) {
            soulBoundArtisanID.addVerifier(initialVerifier);
        }
        
        // Log the deployed contract address
        console.log("SoulBoundArtisanID deployed at:", address(soulBoundArtisanID));
        
        // Stop broadcasting transactions
        vm.stopBroadcast();
    }
}