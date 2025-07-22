// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LinearVesting is Ownable {
    IERC20 public immutable token;
    uint256 public start;
    uint256 public duration;
    address public beneficiary;
    uint256 public released;

    constructor(
        address tokenAddress,
        address beneficiaryAddress,
        uint256 startTime,
        uint256 vestingDuration
    ) {
        token = IERC20(tokenAddress);
        beneficiary = beneficiaryAddress;
        start = startTime;
        duration = vestingDuration;
    }

    function release() public {
        uint256 unreleased = releasableAmount();
        require(unreleased > 0, "Nothing to release");
        released += unreleased;
        token.transfer(beneficiary, unreleased);
    }

    function releasableAmount() public view returns (uint256) {
        return vestedAmount() - released;
    }

    function vestedAmount() public view returns (uint256) {
        if (block.timestamp < start) return 0;
        if (block.timestamp >= start + duration) return token.balanceOf(address(this));
        return (token.balanceOf(address(this)) * (block.timestamp - start)) / duration;
    }
}
