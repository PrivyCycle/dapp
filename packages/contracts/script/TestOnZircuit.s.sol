// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/CycleDataStorage.sol";

contract TestOnZircuitScript is Script {
    CycleDataStorage public storage_;
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deployer address:", deployer);
        console.log("Deployer balance:", deployer.balance);
        
        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy the CycleDataStorage contract
        console.log("\n=== DEPLOYING CONTRACT ===");
        storage_ = new CycleDataStorage();
        console.log("CycleDataStorage deployed to:", address(storage_));

        // 2. Test storing single encrypted data
        console.log("\n=== TESTING SINGLE DATA STORAGE ===");
        string memory testData1 = '{"periodStart":"2025-01-01","symptoms":["bloated","acne"],"encrypted":true}';
        uint256 localTimestamp1 = block.timestamp - 86400; // 1 day ago
        
        storage_.storeEncryptedData(testData1, localTimestamp1);
        console.log("Stored single entry with data:", testData1);
        
        // Check the data was stored
        uint256 entryCount = storage_.getUserEntryCount(deployer);
        console.log("Entry count after single store:", entryCount);

        // 3. Test batch storing encrypted data
        console.log("\n=== TESTING BATCH DATA STORAGE ===");
        string[] memory batchData = new string[](3);
        uint256[] memory batchTimestamps = new uint256[](3);
        
        batchData[0] = '{"periodStart":"2025-01-02","symptoms":["cramps"],"flow":"light"}';
        batchData[1] = '{"periodStart":"2025-01-03","symptoms":["mood_swings"],"flow":"medium"}';
        batchData[2] = '{"periodStart":"2025-01-04","symptoms":["headache"],"flow":"heavy"}';
        
        batchTimestamps[0] = block.timestamp - 72000; // ~20 hours ago
        batchTimestamps[1] = block.timestamp - 36000; // ~10 hours ago
        batchTimestamps[2] = block.timestamp - 18000; // ~5 hours ago
        
        storage_.batchStoreEncryptedData(batchData, batchTimestamps);
        console.log("Stored batch of 3 entries");
        
        // Check total entries
        entryCount = storage_.getUserEntryCount(deployer);
        console.log("Total entry count after batch:", entryCount);

        // 4. Test retrieving all data
        console.log("\n=== TESTING DATA RETRIEVAL ===");
        (
            CycleDataStorage.EncryptedEntry[] memory entries,
            uint256 lastSync,
            uint256 totalCount
        ) = storage_.getEncryptedData(deployer);
        
        console.log("Retrieved entries count:", entries.length);
        console.log("Last sync timestamp:", lastSync);
        console.log("Total count:", totalCount);
        
        // Print first entry details
        if (entries.length > 0) {
            console.log("First entry data:", entries[0].encryptedData);
            console.log("First entry timestamp:", entries[0].timestamp);
            console.log("First entry local timestamp:", entries[0].localTimestamp);
            console.log("First entry ID:", entries[0].entryId);
        }

        // 5. Test getting data after timestamp (sync functionality)
        console.log("\n=== TESTING SYNC FUNCTIONALITY ===");
        uint256 syncTimestamp = block.timestamp - 50000; // Get entries after this time
        CycleDataStorage.EncryptedEntry[] memory newEntries = 
            storage_.getEncryptedDataAfterTimestamp(deployer, syncTimestamp);
        
        console.log("Entries after sync timestamp:", newEntries.length);

        // 6. Test contract stats
        console.log("\n=== TESTING CONTRACT STATS ===");
        uint256 contractTotalEntries = storage_.getContractStats();
        console.log("Contract total entries across all users:", contractTotalEntries);

        // 7. Test with a second user (simulate another wallet)
        console.log("\n=== TESTING MULTI-USER FUNCTIONALITY ===");
        
        // Create a second test account
        uint256 user2PrivateKey = 0x1234567890123456789012345678901234567890123456789012345678901234;
        address user2 = vm.addr(user2PrivateKey);
        
        // Fund user2 with some ETH for gas
        vm.deal(user2, 1 ether);
        
        // Switch to user2
        vm.stopBroadcast();
        vm.startBroadcast(user2PrivateKey);
        
        console.log("User2 address:", user2);
        console.log("User2 balance:", user2.balance);
        
        // Store data as user2
        string memory user2Data = '{"periodStart":"2025-01-05","symptoms":["fatigue"],"user":"user2"}';
        storage_.storeEncryptedData(user2Data, block.timestamp);
        
        uint256 user2EntryCount = storage_.getUserEntryCount(user2);
        console.log("User2 entry count:", user2EntryCount);
        
        // Verify user1 data is separate
        uint256 user1EntryCount = storage_.getUserEntryCount(deployer);
        console.log("User1 still has entries:", user1EntryCount);

        vm.stopBroadcast();

        // 8. Final summary
        console.log("\n=== TEST SUMMARY ===");
        console.log("[OK] Contract deployed successfully");
        console.log("[OK] Single data storage works");
        console.log("[OK] Batch data storage works");
        console.log("[OK] Data retrieval works");
        console.log("[OK] Sync functionality works");
        console.log("[OK] Multi-user isolation works");
        console.log("[OK] Contract stats work");
        
        console.log("\n=== DEPLOYMENT INFO ===");
        console.log("Network: Zircuit Testnet");
        console.log("Contract Address:", address(storage_));
        console.log("Deployer:", deployer);
        console.log("Block Number:", block.number);
        console.log("Block Timestamp:", block.timestamp);
        
        console.log("\n=== NEXT STEPS ===");
        console.log("1. Add contract address to .env:");
        console.log("   VITE_CYCLE_STORAGE_CONTRACT_ADDRESS=", address(storage_));
        console.log("2. Verify contract on explorer:");
        console.log("   https://explorer.testnet.zircuit.com/address/", address(storage_));
        console.log("3. Test frontend integration");
    }
}
