// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract ConsentCycle {
    struct ConsentData {
        address user;
        bytes32 dataHash;
        uint256 timestamp;
        bool isActive;
    }

    mapping(address => ConsentData[]) public userConsents;
    mapping(bytes32 => bool) public consentExists;

    event ConsentGranted(address indexed user, bytes32 indexed dataHash, uint256 timestamp);
    event ConsentRevoked(address indexed user, bytes32 indexed dataHash, uint256 timestamp);

    function grantConsent(bytes32 _dataHash) external {
        require(!consentExists[_dataHash], "Consent already exists");
        
        ConsentData memory consent = ConsentData({
            user: msg.sender,
            dataHash: _dataHash,
            timestamp: block.timestamp,
            isActive: true
        });

        userConsents[msg.sender].push(consent);
        consentExists[_dataHash] = true;

        emit ConsentGranted(msg.sender, _dataHash, block.timestamp);
    }

    function revokeConsent(bytes32 _dataHash) external {
        require(consentExists[_dataHash], "Consent does not exist");
        
        ConsentData[] storage consents = userConsents[msg.sender];
        for (uint256 i = 0; i < consents.length; i++) {
            if (consents[i].dataHash == _dataHash && consents[i].isActive) {
                consents[i].isActive = false;
                consentExists[_dataHash] = false;
                emit ConsentRevoked(msg.sender, _dataHash, block.timestamp);
                break;
            }
        }
    }

    function getUserConsents(address _user) external view returns (ConsentData[] memory) {
        return userConsents[_user];
    }

    function isConsentActive(bytes32 _dataHash) external view returns (bool) {
        return consentExists[_dataHash];
    }
} 