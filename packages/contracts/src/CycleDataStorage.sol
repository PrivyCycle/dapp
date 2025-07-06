// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title CycleDataStorage
 * @dev Simple contract for storing encrypted cycle tracking data on-chain
 * @notice This contract stores encrypted period and symptom data for users
 * @notice Gas sponsorship is handled by Privy's embedded wallets
 */
contract CycleDataStorage {

    // Events
    event DataStored(address indexed user, uint256 indexed entryId, uint256 timestamp);
    event DataBatchStored(address indexed user, uint256 entriesCount, uint256 timestamp);
    event DataRetrieved(address indexed user, uint256 entriesCount);
    event UserDataCleared(address indexed user);
    event DataShared(address indexed sharer, address indexed recipient, string ipfsHash, uint8 shareType);

    // Structs
    struct EncryptedEntry {
        string encryptedData;      // JSON string of encrypted cycle data
        uint256 timestamp;         // When the entry was stored on-chain
        uint256 localTimestamp;    // Original timestamp from local storage
        uint256 entryId;           // Unique entry identifier
    }

    struct UserData {
        EncryptedEntry[] entries;
        uint256 lastSyncTimestamp;
        uint256 totalEntries;
    }

    struct SharedDataPackage {
        string ipfsHash;           // IPFS location of complete encrypted dataset
        address recipient;         // Who can decrypt this
        uint8 shareType;          // 0=partner, 1=family, 2=doctor
        uint256 timestamp;        // When shared (permanent record)
    }

    // State variables
    mapping(address => UserData) private userData;
    mapping(address => SharedDataPackage[]) public sharedByUser;
    mapping(address => SharedDataPackage[]) public sharedToUser;
    uint256 private entryCounter;
    
    // Constants
    uint256 public constant MAX_BATCH_SIZE = 50; // Prevent gas limit issues
    uint256 public constant MAX_DATA_SIZE = 10000; // Max bytes per entry

    // Modifiers
    modifier validDataSize(string calldata data) {
        require(bytes(data).length <= MAX_DATA_SIZE, "CycleDataStorage: Data too large");
        _;
    }

    /**
     * @dev Store a single encrypted data entry for the caller
     * @param encryptedData The encrypted JSON data
     * @param localTimestamp The original timestamp from local storage
     */
    function storeEncryptedData(
        string calldata encryptedData,
        uint256 localTimestamp
    ) external validDataSize(encryptedData) {
        _storeEntry(msg.sender, encryptedData, localTimestamp);
    }

    /**
     * @dev Store multiple encrypted data entries in a batch
     * @param encryptedDataArray Array of encrypted JSON data
     * @param localTimestamps Array of original timestamps from local storage
     */
    function batchStoreEncryptedData(
        string[] calldata encryptedDataArray,
        uint256[] calldata localTimestamps
    ) external {
        require(
            encryptedDataArray.length <= MAX_BATCH_SIZE,
            "CycleDataStorage: Batch too large"
        );
        require(
            encryptedDataArray.length == localTimestamps.length,
            "CycleDataStorage: Array length mismatch"
        );

        for (uint256 i = 0; i < encryptedDataArray.length; i++) {
            require(
                bytes(encryptedDataArray[i]).length <= MAX_DATA_SIZE,
                "CycleDataStorage: Data too large"
            );
            _storeEntry(msg.sender, encryptedDataArray[i], localTimestamps[i]);
        }

        emit DataBatchStored(msg.sender, encryptedDataArray.length, block.timestamp);
    }

    /**
     * @dev Internal function to store a single entry
     */
    function _storeEntry(
        address user,
        string calldata encryptedData,
        uint256 localTimestamp
    ) internal {
        entryCounter++;
        uint256 entryId = entryCounter;
        
        EncryptedEntry memory newEntry = EncryptedEntry({
            encryptedData: encryptedData,
            timestamp: block.timestamp,
            localTimestamp: localTimestamp,
            entryId: entryId
        });

        UserData storage userDataRef = userData[user];
        userDataRef.entries.push(newEntry);
        userDataRef.totalEntries++;
        userDataRef.lastSyncTimestamp = block.timestamp;

        emit DataStored(user, entryId, block.timestamp);
    }

    /**
     * @dev Get all encrypted data for a user
     * @param user The user address to query
     * @return entries Array of encrypted entries
     * @return lastSync Last synchronization timestamp
     * @return totalCount Total number of entries
     */
    function getEncryptedData(address user)
        external
        view
        returns (
            EncryptedEntry[] memory entries,
            uint256 lastSync,
            uint256 totalCount
        )
    {
        UserData storage userDataRef = userData[user];
        return (
            userDataRef.entries,
            userDataRef.lastSyncTimestamp,
            userDataRef.totalEntries
        );
    }

    /**
     * @dev Get encrypted data for a user within a range
     * @param user The user address to query
     * @param start Start index (inclusive)
     * @param end End index (exclusive)
     * @return entries Array of encrypted entries in the specified range
     */
    function getEncryptedDataRange(
        address user,
        uint256 start,
        uint256 end
    ) external view returns (EncryptedEntry[] memory entries) {
        UserData storage userDataRef = userData[user];
        require(start < userDataRef.entries.length, "CycleDataStorage: Start index out of bounds");
        require(end <= userDataRef.entries.length, "CycleDataStorage: End index out of bounds");
        require(start < end, "CycleDataStorage: Invalid range");

        uint256 length = end - start;
        entries = new EncryptedEntry[](length);
        
        for (uint256 i = 0; i < length; i++) {
            entries[i] = userDataRef.entries[start + i];
        }
    }

    /**
     * @dev Get entries stored after a specific timestamp
     * @param user The user address to query
     * @param afterTimestamp Only return entries stored after this timestamp
     * @return entries Array of encrypted entries
     */
    function getEncryptedDataAfterTimestamp(
        address user,
        uint256 afterTimestamp
    ) external view returns (EncryptedEntry[] memory entries) {
        UserData storage userDataRef = userData[user];
        
        // Count entries after timestamp
        uint256 count = 0;
        for (uint256 i = 0; i < userDataRef.entries.length; i++) {
            if (userDataRef.entries[i].timestamp > afterTimestamp) {
                count++;
            }
        }

        // Create result array
        entries = new EncryptedEntry[](count);
        uint256 resultIndex = 0;
        
        for (uint256 i = 0; i < userDataRef.entries.length; i++) {
            if (userDataRef.entries[i].timestamp > afterTimestamp) {
                entries[resultIndex] = userDataRef.entries[i];
                resultIndex++;
            }
        }
    }

    /**
     * @dev Get the last sync timestamp for a user
     * @param user The user address to query
     * @return timestamp The last synchronization timestamp
     */
    function getLastSyncTimestamp(address user) external view returns (uint256) {
        return userData[user].lastSyncTimestamp;
    }

    /**
     * @dev Get the total number of entries for a user
     * @param user The user address to query
     * @return count Total number of entries
     */
    function getUserEntryCount(address user) external view returns (uint256) {
        return userData[user].totalEntries;
    }

    /**
     * @dev Clear all data for the caller (emergency function)
     */
    function clearMyData() external {
        delete userData[msg.sender];
        emit UserDataCleared(msg.sender);
    }

    /**
     * @dev Share encrypted data with another user
     * @param recipient The address of the user to share data with
     * @param ipfsHash The IPFS hash of the encrypted data package
     * @param shareType The type of sharing (0=partner, 1=family, 2=doctor)
     */
    function shareData(
        address recipient,
        string calldata ipfsHash,
        uint8 shareType
    ) external {
        require(recipient != address(0), "CycleDataStorage: Invalid recipient");
        require(recipient != msg.sender, "CycleDataStorage: Cannot share with yourself");
        require(bytes(ipfsHash).length > 0, "CycleDataStorage: Invalid IPFS hash");
        require(shareType <= 2, "CycleDataStorage: Invalid share type");

        SharedDataPackage memory newShare = SharedDataPackage({
            ipfsHash: ipfsHash,
            recipient: recipient,
            shareType: shareType,
            timestamp: block.timestamp
        });

        // Add to both mappings for efficient lookups
        sharedByUser[msg.sender].push(newShare);
        sharedToUser[recipient].push(newShare);

        emit DataShared(msg.sender, recipient, ipfsHash, shareType);
    }

    /**
     * @dev Get all data packages shared by the caller
     * @return shares Array of shared data packages
     */
    function getMyShares() external view returns (SharedDataPackage[] memory shares) {
        return sharedByUser[msg.sender];
    }

    /**
     * @dev Get all data packages shared with the caller
     * @return shares Array of shared data packages
     */
    function getSharedWithMe() external view returns (SharedDataPackage[] memory shares) {
        return sharedToUser[msg.sender];
    }

    /**
     * @dev Get data packages shared by a specific user (public for transparency)
     * @param user The user address to query
     * @return shares Array of shared data packages
     */
    function getSharedByUser(address user) external view returns (SharedDataPackage[] memory shares) {
        return sharedByUser[user];
    }

    /**
     * @dev Get data packages shared with a specific user (public for transparency)
     * @param user The user address to query
     * @return shares Array of shared data packages
     */
    function getSharedWithUser(address user) external view returns (SharedDataPackage[] memory shares) {
        return sharedToUser[user];
    }

    /**
     * @dev Get the total number of shares created by a user
     * @param user The user address to query
     * @return count Total number of shares created
     */
    function getShareCount(address user) external view returns (uint256 count) {
        return sharedByUser[user].length;
    }

    /**
     * @dev Get the total number of shares received by a user
     * @param user The user address to query
     * @return count Total number of shares received
     */
    function getReceivedShareCount(address user) external view returns (uint256 count) {
        return sharedToUser[user].length;
    }

    /**
     * @dev Get contract statistics
     * @return totalEntries Total entries across all users
     */
    function getContractStats() external view returns (uint256 totalEntries) {
        totalEntries = entryCounter;
    }
}
