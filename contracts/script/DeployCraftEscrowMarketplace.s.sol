// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/CraftEscrowMarketplace.sol";

contract DeployCraftEscrowMarketplace is Script {
    function run() external {
        // Retrieve private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address craftNFTAddress = 0x7dE9da95ec835baF710F3Bca82ed399311293cb8;
        
        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);

        // Deploy the marketplace contract
        CraftEscrowMarketplace marketplace = new CraftEscrowMarketplace(craftNFTAddress);
        
        // Log the deployed contract address
        console.log("CraftEscrowMarketplace deployed at:", address(marketplace));
        
        // Stop broadcasting transactions
        vm.stopBroadcast();
    }
}