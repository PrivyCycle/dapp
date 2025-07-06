// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/CycleDataStorage.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy the CycleDataStorage contract
        CycleDataStorage storage_ = new CycleDataStorage();

        console.log("CycleDataStorage deployed to:", address(storage_));

        vm.stopBroadcast();
    }
}
