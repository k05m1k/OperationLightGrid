// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";

interface ISentinelToken {
    function mintXP(address to, uint8 xpType, uint256 amount) external;
}

/// @title QuestClaim — refactored to act as IXPEmitter
contract QuestClaim is AccessControl {
    bytes32 public constant CLAIM_VERIFIER_ROLE = keccak256("CLAIM_VERIFIER_ROLE");
    ISentinelToken public sentinel;

    // Optional replay protection
    mapping(address => mapping(uint256 => bool)) public claimedQuest;

    event XPClaimed(address indexed player, uint8 indexed xpType, uint256 amount, uint256 questId);

    constructor(address sentinelAddress, address daoExecutor) {
        _setupRole(DEFAULT_ADMIN_ROLE, daoExecutor);
        _setupRole(CLAIM_VERIFIER_ROLE, daoExecutor);
        sentinel = ISentinelToken(sentinelAddress);
    }

    function emitXP(address player, uint256 amount, uint8 xpType) external onlyRole(CLAIM_VERIFIER_ROLE) {
        sentinel.mintXP(player, xpType, amount);
        emit XPClaimed(player, xpType, amount, 0);
    }

    function claimQuestXP(address player, uint256 questId, uint256 amount, uint8 xpType) external onlyRole(CLAIM_VERIFIER_ROLE) {
        require(!claimedQuest[player][questId], "Already claimed");
        claimedQuest[player][questId] = true;
        sentinel.mintXP(player, xpType, amount);
        emit XPClaimed(player, xpType, amount, questId);
    }

    function setSentinel(address newSentinel) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newSentinel != address(0), "Zero address");
        sentinel = ISentinelToken(newSentinel);
    }
}