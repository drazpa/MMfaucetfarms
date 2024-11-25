// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LOVEStaking is ReentrancyGuard, Ownable {
    IERC20 public loveToken;
    
    struct StakeInfo {
        uint256 amount;
        uint256 lastClaimTime;
    }
    
    mapping(address => StakeInfo) public stakes;
    
    uint256 public constant APY = 1 ether; // 100% APY
    uint256 public constant CLAIM_INTERVAL = 60; // 1 minute
    
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    
    constructor(address _tokenAddress) Ownable(msg.sender) {
        loveToken = IERC20(_tokenAddress);
    }
    
    function stake(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Cannot stake 0");
        require(loveToken.transferFrom(msg.sender, address(this), _amount), "Transfer failed");
        
        StakeInfo storage userStake = stakes[msg.sender];
        
        // If already staking, claim pending rewards first
        if (userStake.amount > 0) {
            _claimRewards();
        }
        
        userStake.amount += _amount;
        userStake.lastClaimTime = block.timestamp;
        
        emit Staked(msg.sender, _amount);
    }
    
    function unstake() external nonReentrant {
        StakeInfo storage userStake = stakes[msg.sender];
        require(userStake.amount > 0, "No stake found");
        
        // Claim any pending rewards first
        _claimRewards();
        
        uint256 amount = userStake.amount;
        userStake.amount = 0;
        userStake.lastClaimTime = 0;
        
        require(loveToken.transfer(msg.sender, amount), "Transfer failed");
        
        emit Unstaked(msg.sender, amount);
    }
    
    function claimRewards() external nonReentrant {
        _claimRewards();
    }
    
    function _claimRewards() internal {
        StakeInfo storage userStake = stakes[msg.sender];
        require(userStake.amount > 0, "No stake found");
        require(block.timestamp >= userStake.lastClaimTime + CLAIM_INTERVAL, "Too soon to claim");
        
        uint256 timeElapsed = block.timestamp - userStake.lastClaimTime;
        uint256 rewards = (userStake.amount * APY * timeElapsed) / (365 days);
        
        userStake.lastClaimTime = block.timestamp;
        
        require(loveToken.transfer(msg.sender, rewards), "Transfer failed");
        
        emit RewardsClaimed(msg.sender, rewards);
    }
    
    function getStakeInfo(address _user) external view returns (
        uint256 stakedAmount,
        uint256 lastClaimTime,
        uint256 pendingRewards
    ) {
        StakeInfo memory userStake = stakes[_user];
        
        uint256 timeElapsed = block.timestamp - userStake.lastClaimTime;
        uint256 rewards = (userStake.amount * APY * timeElapsed) / (365 days);
        
        return (
            userStake.amount,
            userStake.lastClaimTime,
            rewards
        );
    }
}