// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "forge-std/Script.sol";
import "../src/EcoToken.sol";

contract DeployEcoToken is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy EcoToken contract
        EcoToken ecoToken = new EcoToken();
        
        console.log("EcoToken deployed at:", address(ecoToken));
        
        vm.stopBroadcast();
    }
}