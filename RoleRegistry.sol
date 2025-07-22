// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @title RoleRegistry
/// @notice Centralized reference contract for role hashes and descriptions used in the Operation Light Grid DAO
contract RoleRegistry {
    // Role identifiers (used with AccessControl)
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant CLAIM_VERIFIER_ROLE = keccak256("CLAIM_VERIFIER_ROLE");
    bytes32 public constant QUEST_DESIGNER_ROLE = keccak256("QUEST_DESIGNER_ROLE");
    bytes32 public constant HAT_ASSIGNER_ROLE = keccak256("HAT_ASSIGNER_ROLE");
    bytes32 public constant DAO_EXECUTOR_ROLE = keccak256("DAO_EXECUTOR_ROLE");

    /// @notice Returns a short description of the role
    function describeRole(bytes32 role) external pure returns (string memory) {
        if (role == MINTER_ROLE) return "Can mint XP or reward tokens.";
        if (role == CLAIM_VERIFIER_ROLE) return "Authorized to validate and trigger XP claims.";
        if (role == QUEST_DESIGNER_ROLE) return "Can submit or modify quest lines.";
        if (role == HAT_ASSIGNER_ROLE) return "Can assign Hats Protocol roles.";
        if (role == DAO_EXECUTOR_ROLE) return "Permitted to execute DAO transactions via Zodiac.";
        return "Unknown role";
    }
}