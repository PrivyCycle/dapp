// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CyclePaymaster
 * @dev Simple paymaster contract for sponsoring gas fees for cycle data storage
 * @notice This contract pays for gas fees for the CycleDataStorage contract
 */
contract CyclePaymaster is Ownable {
    
    // Events
    event PaymasterFunded(address indexed funder, uint256 amount);
    event GasSponsored(address indexed user, uint256 gasCost);

    // The storage contract we sponsor gas for
    address public storageContract;

    constructor(address _storageContract) Ownable(msg.sender) {
        storageContract = _storageContract;
    }

    /**
     * @dev Receive function to accept ETH deposits
     */
    receive() external payable {
        emit PaymasterFunded(msg.sender, msg.value);
    }

    /**
     * @dev Set the storage contract address
     * @param _storageContract The new storage contract address
     */
    function setStorageContract(address _storageContract) external onlyOwner {
        storageContract = _storageContract;
    }

    /**
     * @dev Sponsor gas for a user transaction to the storage contract
     * @param user The user whose transaction is being sponsored
     * @param gasCost The cost of gas to refund
     */
    function sponsorGas(address user, uint256 gasCost) external {
        require(msg.sender == storageContract, "CyclePaymaster: Only storage contract");
        require(address(this).balance >= gasCost, "CyclePaymaster: Insufficient balance");
        
        // Send gas refund
        (bool success, ) = payable(tx.origin).call{value: gasCost}("");
        require(success, "CyclePaymaster: Gas refund failed");
        
        emit GasSponsored(user, gasCost);
    }

    /**
     * @dev Withdraw ETH from the paymaster (owner only)
     * @param amount Amount of ETH to withdraw
     */
    function withdraw(uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "CyclePaymaster: Insufficient balance");
        
        (bool success, ) = payable(owner()).call{value: amount}("");
        require(success, "CyclePaymaster: Withdrawal failed");
    }

    /**
     * @dev Get the current balance of the paymaster
     * @return balance The ETH balance
     */
    function getBalance() external view returns (uint256 balance) {
        return address(this).balance;
    }
}
