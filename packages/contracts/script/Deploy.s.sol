// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {ConsentCycle} from "../src/ConsentCycle.sol";

contract DeployScript is Script {
    function run() public {
        vm.startBroadcast();

        ConsentCycle consentCycle = new ConsentCycle();

        console.log("ConsentCycle deployed at:", address(consentCycle));

        vm.stopBroadcast();
    }
} 