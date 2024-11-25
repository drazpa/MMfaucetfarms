// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LOVEFarming is ReentrancyGuard, Ownable {
    IERC20 public loveToken;
    
    struct Farm {
        uint256 count;
        uint256 lastClaimTime;
        bool isPaused;
    }
    
    mapping(address => Farm) public farms;
    
    uint256 public constant FARM_COST = 10000 * 10**18; // 10,000 LOVE tokens per farm
    uint256 public constant FARM_RATE = 10**11; // 0.00000000001 LOVE per millisecond
    
    event FarmPurchased(address indexed user, uint256 count);
    event FarmClaimed(address indexed user, uint256 amount);
    event FarmingPaused(address indexed user);
    event FarmingResumed(address indexed user);
    
    constructor(address _tokenAddress) Ownable(msg.sender) {
        loveToken = IERC20(_tokenAddress);
    }
    
    function buyFarm(uint256 _count) external nonReentrant {
        require(_count > 0, "Must buy at least 1 farm");
        uint256 totalCost = FARM_COST * _count;
        require(loveToken.transferFrom(msg.sender, address(this), totalCost), "Transfer failed");
        
        Farm storage farm = farms[msg.sender];
        
        // If already farming, claim pending rewards first
        if (farm.count > 0 && !farm.isPaused) {
            _claimRewards();
        }
        
        farm.count += _count;
        farm.lastClaimTime = block.timestamp;
        farm.isPaused = false;
        
        emit FarmPurchased(msg.sender, _count);
    }
    
    function toggleFarming() external nonReentrant {
        Farm storage farm = farms[msg.sender];
        require(farm.count > 0, "No farms owned");
        
        if (!farm.isPaused) {
            // Claim rewards before pausing
            _claimRewards();
            farm.isPaused = true;
            emit FarmingPaused(msg.sender);
        } else {
            farm.isPaused = false;
            farm.lastClaimTime = block.timestamp;
            emit FarmingResumed(msg.sender);
        }
    }
    
    function claimRewards() external nonReentrant {
        _claimRewards();
    }
    
    function _claimRewards() internal {
        Farm storage farm = farms[msg.sender];
        require(farm.count > 0, "No farms owned");
        require(!farm.isPaused, "Farming is paused");
        
        uint256 timeElapsed = block.timestamp - farm.lastClaimTime;
        uint256 rewards = farm.count * FARM_RATE * timeElapsed;
        
        farm.lastClaimTime = block.timestamp;
        
        require(loveToken.transfer(msg.sender, rewards), "Transfer failed");
        
        emit FarmClaimed(msg.sender, rewards);
    }
    
    function getFarmInfo(address _user) external view returns (
        uint256 farmCount,
        uint256 lastClaimTime,
        uint256 pendingRewards,
        bool isPaused
    ) {
        Farm memory farm = farms[_user];
        
        uint256 rewards = 0;
        if (farm.count > 0 && !farm.isPaused) {
            uint256 timeElapsed = block.timestamp - farm.lastClaimTime;
            rewards = farm.count * FARM_RATE * timeElapsed;
        }
        
        return (
            farm.count,
            farm.lastClaimTime,
            rewards,
            farm.isPaused
        );
    }
}