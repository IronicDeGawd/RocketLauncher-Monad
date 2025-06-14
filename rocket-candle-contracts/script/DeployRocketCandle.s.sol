// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {RocketCandle} from "../src/RocketCandle.sol";
import {RocketCandleScores} from "../src/RocketCandleScores.sol";
import {RocketFuel} from "../src/RocketFuel.sol";

contract DeployRocketCandle is Script {
    function run() external {
        string memory privateKeyString = vm.envString("PRIVATE_KEY");
        uint256 deployerPrivateKey;

        // Convert string to uint256, handling both with and without 0x prefix
        if (bytes(privateKeyString).length == 64) {
            // No 0x prefix
            deployerPrivateKey = vm.parseUint(string.concat("0x", privateKeyString));
        } else {
            // With 0x prefix
            deployerPrivateKey = vm.parseUint(privateKeyString);
        }

        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deploying contracts with account:", deployer);
        console.log("Account balance:", deployer.balance);

        vm.startBroadcast(deployerPrivateKey);

        // Deploy RocketFuel token first
        RocketFuel rocketFuel = new RocketFuel();
        console.log("RocketFuel deployed to:", address(rocketFuel));

        // Deploy RocketCandleScores
        RocketCandleScores rocketCandleScores = new RocketCandleScores();
        console.log("RocketCandleScores deployed to:", address(rocketCandleScores));

        // Deploy main RocketCandle contract (deployer acts as initial server)
        RocketCandle rocketCandle = new RocketCandle(deployer);
        console.log("RocketCandle deployed to:", address(rocketCandle));

        vm.stopBroadcast();

        // Log deployment info
        console.log("\n=== DEPLOYMENT SUMMARY ===");
        console.log("RocketFuel:", address(rocketFuel));
        console.log("RocketCandleScores:", address(rocketCandleScores));
        console.log("RocketCandle:", address(rocketCandle));
        console.log("Deployer/Initial Server:", deployer);
        console.log("==========================");
    }
}
