// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract WUNToken is ERC20 {
    constructor() ERC20("WUN Token", "WUN") {
        _mint(msg.sender, 111_000_000 ether);
    }
}
