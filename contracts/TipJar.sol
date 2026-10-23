// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TipJar
 * @dev Demo Antigravity - Web3 tip jar and wall of fame for Ethereum Sepolia.
 */
contract TipJar {
    struct Tip {
        address from;
        string name;
        string message;
        uint256 amount;
        uint256 timestamp;
    }

    Tip[] public tips;
    address payable public immutable owner;

    event NewTip(
        address indexed from,
        string name,
        string message,
        uint256 amount,
        uint256 timestamp
    );

    constructor() {
        owner = payable(msg.sender);
    }

    /**
     * @dev Send a tip with an author name and message.
     */
    function sendTip(string calldata _name, string calldata _message) external payable {
        require(msg.value > 0, "Tip amount must be greater than zero");
        require(bytes(_name).length > 0, "Name cannot be empty");

        tips.push(Tip(msg.sender, _name, _message, msg.value, block.timestamp));

        emit NewTip(msg.sender, _name, _message, msg.value, block.timestamp);
    }

    /**
     * @dev Retrieve all tips for displaying on the Wall of Fame.
     */
    function getAllTips() external view returns (Tip[] memory) {
        return tips;
    }

    /**
     * @dev Get total number of tips received.
     */
    function getTotalTips() external view returns (uint256) {
        return tips.length;
    }

    /**
     * @dev Allows the contract owner to withdraw accumulated funds.
     */
    function withdraw() external {
        require(msg.sender == owner, "Only the owner can withdraw");
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        owner.transfer(balance);
    }
}
