// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract LOVEWheel is Ownable, ReentrancyGuard {
    IERC20 public loveToken;
    uint256 public constant SPIN_COST = 100 * 10**18; // 100 LOVE tokens
    uint256 public totalSpins;
    uint256 public totalWinnings;
    
    struct SpinResult {
        address player;
        uint256 amount;
        uint256 timestamp;
    }
    
    mapping(address => uint256) public playerSpins;
    mapping(address => uint256) public playerWinnings;
    SpinResult[] public spinHistory;
    
    event WheelSpun(address indexed player, uint256 amount);
    
    constructor(address _tokenAddress) Ownable(msg.sender) {
        loveToken = IERC20(_tokenAddress);
    }
    
    function spin() external nonReentrant {
        require(loveToken.transferFrom(msg.sender, address(this), SPIN_COST), "Transfer failed");
        
        // Generate random number (in production, use Chainlink VRF)
        uint256 randomNumber = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender,
            totalSpins
        ))) % 50; // 50 different slices
        
        // Calculate prize (0 for X spots, otherwise 1-10000 LOVE)
        uint256 prize = calculatePrize(randomNumber);
        
        if (prize > 0) {
            require(loveToken.transfer(msg.sender, prize * 10**18), "Prize transfer failed");
            playerWinnings[msg.sender] += prize;
            totalWinnings += prize;
        }
        
        playerSpins[msg.sender]++;
        totalSpins++;
        
        spinHistory.push(SpinResult({
            player: msg.sender,
            amount: prize,
            timestamp: block.timestamp
        }));
        
        emit WheelSpun(msg.sender, prize);
    }
    
    function calculatePrize(uint256 randomNumber) internal pure returns (uint256) {
        // 20% chance of X (no prize)
        if (randomNumber < 10) return 0;
        
        // Remaining 40 slots with prizes
        uint256 baseAmount = (randomNumber % 100) + 1; // 1-100
        uint256 multiplier = (randomNumber % 100) + 1; // 1-100
        
        return (baseAmount * multiplier) % 10001; // Max 10000 LOVE
    }
    
    function getPlayerStats(address player) external view returns (
        uint256 spins,
        uint256 winnings
    ) {
        return (playerSpins[player], playerWinnings[player]);
    }
    
    function getRecentSpins(uint256 count) external view returns (SpinResult[] memory) {
        uint256 resultCount = count > spinHistory.length ? spinHistory.length : count;
        SpinResult[] memory results = new SpinResult[](resultCount);
        
        for (uint256 i = 0; i < resultCount; i++) {
            results[i] = spinHistory[spinHistory.length - 1 - i];
        }
        
        return results;
    }
    
    function withdrawFees() external onlyOwner {
        uint256 balance = loveToken.balanceOf(address(this));
        require(loveToken.transfer(owner(), balance), "Withdrawal failed");
    }
}