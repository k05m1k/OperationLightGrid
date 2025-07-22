// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/// @title SentinelToken — Typed XP Soulbound Token
contract SentinelToken is ERC1155, AccessControl {
    using Strings for uint256;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant URI_SETTER_ROLE = keccak256("URI_SETTER_ROLE");

    mapping(uint8 => string) public xpTypeNames;

    constructor(string memory baseURI, address daoAdmin) ERC1155(baseURI) {
        _setupRole(DEFAULT_ADMIN_ROLE, daoAdmin);
        _setupRole(MINTER_ROLE, daoAdmin);
        _setupRole(URI_SETTER_ROLE, daoAdmin);

        xpTypeNames[0] = "GENERAL";
        xpTypeNames[1] = "COMBAT";
        xpTypeNames[2] = "CRAFT";
        xpTypeNames[3] = "SOCIAL";
        xpTypeNames[4] = "LEADERSHIP";
    }

    /// @notice Mint XP of specific type to user (soulbound)
    function mintXP(address to, uint8 xpType, uint256 amount) external onlyRole(MINTER_ROLE) {
        require(to != address(0), "Invalid address");
        require(xpType <= 4, "Invalid XP type");
        _mint(to, xpType, amount, "");
    }

    /// @notice Override to prevent transfer (soulbound)
    function safeTransferFrom(address, address, uint256, uint256, bytes memory) public pure override {
        revert("Soulbound: Transfers disabled");
    }

    /// @notice Override to prevent batch transfer (soulbound)
    function safeBatchTransferFrom(address, address, uint256[] memory, uint256[] memory, bytes memory) public pure override {
        revert("Soulbound: Batch transfers disabled");
    }

    /// @notice Prevent setting approval
    function setApprovalForAll(address, bool) public pure override {
        revert("Soulbound: Approvals disabled");
    }

    /// @notice Track XP balance per type
    function xpBalanceOf(address user, uint8 xpType) external view returns (uint256) {
        return balanceOf(user, xpType);
    }

    /// @notice Get name of XP type
    function getXPTypeName(uint8 xpType) external view returns (string memory) {
        return xpTypeNames[xpType];
    }

    /// @notice Set custom URI for metadata
    function setURI(string memory newuri) external onlyRole(URI_SETTER_ROLE) {
        _setURI(newuri);
    }
}