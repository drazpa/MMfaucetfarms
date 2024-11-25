// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract LOVEFaucet {
    IERC20 public loveToken;
    mapping(address => uint256) public lastClaim;
    uint256 public constant CLAIM_AMOUNT = 5 * 10**18; // 5 LOVE
    uint256 public constant COOLDOWN = 24 hours;

    event Claimed(address indexed user, uint256 amount);

    constructor(address _tokenAddress) {
        loveToken = IERC20(_tokenAddress);
    }

    function claim() external {
        require(block.timestamp >= lastClaim[msg.sender] + COOLDOWN, "Wait 24h between claims");
        lastClaim[msg.sender] = block.timestamp;
        loveToken.transfer(msg.sender, CLAIM_AMOUNT);
        emit Claimed(msg.sender, CLAIM_AMOUNT);
    }
}