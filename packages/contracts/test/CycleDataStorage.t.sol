// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/CycleDataStorage.sol";

contract CycleDataStorageTest is Test {
    CycleDataStorage public storage_;
    
    address public user1 = address(0x1);
    address public user2 = address(0x2);
    
    function setUp() public {
        storage_ = new CycleDataStorage();
    }
    
    function testStoreEncryptedData() public {
        vm.prank(user1);
        
        string memory encryptedData = "encrypted_cycle_data_json";
        uint256 localTimestamp = block.timestamp;
        
        storage_.storeEncryptedData(encryptedData, localTimestamp);
        
        (
            CycleDataStorage.EncryptedEntry[] memory entries,
            uint256 lastSync,
            uint256 totalCount
        ) = storage_.getEncryptedData(user1);
        
        assertEq(entries.length, 1);
        assertEq(entries[0].encryptedData, encryptedData);
        assertEq(entries[0].localTimestamp, localTimestamp);
        assertEq(totalCount, 1);
        assertGt(lastSync, 0);
    }
    
    function testBatchStoreEncryptedData() public {
        vm.prank(user1);
        
        string[] memory encryptedDataArray = new string[](3);
        uint256[] memory localTimestamps = new uint256[](3);
        
        encryptedDataArray[0] = "encrypted_data_1";
        encryptedDataArray[1] = "encrypted_data_2";
        encryptedDataArray[2] = "encrypted_data_3";
        
        localTimestamps[0] = block.timestamp;
        localTimestamps[1] = block.timestamp + 1000;
        localTimestamps[2] = block.timestamp + 2000;
        
        storage_.batchStoreEncryptedData(encryptedDataArray, localTimestamps);
        
        (
            CycleDataStorage.EncryptedEntry[] memory entries,
            ,
            uint256 totalCount
        ) = storage_.getEncryptedData(user1);
        
        assertEq(entries.length, 3);
        assertEq(totalCount, 3);
        assertEq(entries[0].encryptedData, "encrypted_data_1");
        assertEq(entries[1].encryptedData, "encrypted_data_2");
        assertEq(entries[2].encryptedData, "encrypted_data_3");
    }
    
    function testGetUserEntryCount() public {
        vm.prank(user1);
        storage_.storeEncryptedData("test_data", block.timestamp);
        
        uint256 count = storage_.getUserEntryCount(user1);
        assertEq(count, 1);
        
        uint256 emptyCount = storage_.getUserEntryCount(user2);
        assertEq(emptyCount, 0);
    }
    
    function testGetEncryptedDataAfterTimestamp() public {
        vm.startPrank(user1);
        
        // Store some data
        storage_.storeEncryptedData("data_1", block.timestamp);
        
        uint256 checkpointTime = block.timestamp;
        vm.warp(block.timestamp + 1000); // Move time forward
        
        storage_.storeEncryptedData("data_2", block.timestamp);
        
        vm.stopPrank();
        
        // Get data after checkpoint
        CycleDataStorage.EncryptedEntry[] memory newEntries = 
            storage_.getEncryptedDataAfterTimestamp(user1, checkpointTime);
        
        assertEq(newEntries.length, 1);
        assertEq(newEntries[0].encryptedData, "data_2");
    }
    
    function testClearMyData() public {
        vm.startPrank(user1);
        
        // Store some data
        storage_.storeEncryptedData("test_data", block.timestamp);
        
        // Verify data exists
        uint256 countBefore = storage_.getUserEntryCount(user1);
        assertEq(countBefore, 1);
        
        // Clear data (still as user1)
        storage_.clearMyData();
        
        vm.stopPrank();
        
        // Verify data is cleared
        uint256 countAfter = storage_.getUserEntryCount(user1);
        assertEq(countAfter, 0);
    }
}
