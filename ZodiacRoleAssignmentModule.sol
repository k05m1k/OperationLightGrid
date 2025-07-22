// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";

interface IProposalValidator {
    function assertValidAssignment(address to, bytes32 role) external;
}

/// @title ZodiacRoleAssignmentModule (with ProposalValidator)
/// @notice DAO-controlled module for assigning roles using AccessControl and enforcing rules via ProposalValidator
contract ZodiacRoleAssignmentModule is AccessControl {
    bytes32 public constant DAO_EXECUTOR_ROLE = keccak256("DAO_EXECUTOR_ROLE");

    IProposalValidator public validator;

    constructor(address daoMultisig, address validatorAddress) {
        require(daoMultisig != address(0), "Invalid DAO address");
        require(validatorAddress != address(0), "Invalid validator");
        _setupRole(DEFAULT_ADMIN_ROLE, daoMultisig);
        _setupRole(DAO_EXECUTOR_ROLE, daoMultisig);
        validator = IProposalValidator(validatorAddress);
    }

    /// @notice Assign a role after passing ProposalValidator checks
    function assignRole(
        address targetContract,
        bytes32 role,
        address account
    ) external onlyRole(DAO_EXECUTOR_ROLE) {
        validator.assertValidAssignment(account, role);
        AccessControl(targetContract).grantRole(role, account);
    }

    /// @notice Revoke a role with DAO authority
    function revokeRoleInTarget(
        address targetContract,
        bytes32 role,
        address account
    ) external onlyRole(DAO_EXECUTOR_ROLE) {
        AccessControl(targetContract).revokeRole(role, account);
    }

    /// @notice Update the proposal validator (DAO-only)
    function updateValidator(address newValidator) external onlyRole(DAO_EXECUTOR_ROLE) {
        require(newValidator != address(0), "Invalid validator");
        validator = IProposalValidator(newValidator);
    }
}