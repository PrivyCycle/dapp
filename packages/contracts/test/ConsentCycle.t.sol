// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {ConsentCycle} from "../src/ConsentCycle.sol";

contract ConsentCycleTest is Test {
    ConsentCycle public consentCycle;
    address public user1 = makeAddr("user1");
    address public user2 = makeAddr("user2");

    function setUp() public {
        consentCycle = new ConsentCycle();
    }

    function testGrantConsent() public {
        bytes32 dataHash = keccak256("test data");
        
        vm.prank(user1);
        consentCycle.grantConsent(dataHash);
        
        assertTrue(consentCycle.isConsentActive(dataHash));
        
        ConsentCycle.ConsentData[] memory consents = consentCycle.getUserConsents(user1);
        assertEq(consents.length, 1);
        assertEq(consents[0].user, user1);
        assertEq(consents[0].dataHash, dataHash);
        assertTrue(consents[0].isActive);
    }

    function testRevokeConsent() public {
        bytes32 dataHash = keccak256("test data");
        
        vm.prank(user1);
        consentCycle.grantConsent(dataHash);
        
        vm.prank(user1);
        consentCycle.revokeConsent(dataHash);
        
        assertFalse(consentCycle.isConsentActive(dataHash));
    }

    function testCannotGrantDuplicateConsent() public {
        bytes32 dataHash = keccak256("test data");
        
        vm.prank(user1);
        consentCycle.grantConsent(dataHash);
        
        vm.prank(user2);
        vm.expectRevert("Consent already exists");
        consentCycle.grantConsent(dataHash);
    }

    function testCannotRevokeNonexistentConsent() public {
        bytes32 dataHash = keccak256("test data");
        
        vm.prank(user1);
        vm.expectRevert("Consent does not exist");
        consentCycle.revokeConsent(dataHash);
    }

    function testMultipleConsentsPerUser() public {
        bytes32 dataHash1 = keccak256("test data 1");
        bytes32 dataHash2 = keccak256("test data 2");
        
        vm.prank(user1);
        consentCycle.grantConsent(dataHash1);
        
        vm.prank(user1);
        consentCycle.grantConsent(dataHash2);
        
        ConsentCycle.ConsentData[] memory consents = consentCycle.getUserConsents(user1);
        assertEq(consents.length, 2);
        assertTrue(consentCycle.isConsentActive(dataHash1));
        assertTrue(consentCycle.isConsentActive(dataHash2));
    }
} 