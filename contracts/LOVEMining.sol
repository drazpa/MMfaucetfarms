// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LOVEMining is ReentrancyGuard, Ownable {
    IERC20 public loveToken;
    
    struct MinerInfo {
        uint256 amount;
        uint256 lastClaimTime;
        bool isPaused;
    }
    
    mapping(address => MinerInfo) public miners;
    
    uint256 public constant APY = 1 ether; // 100% APY
    
    event Started(address indexed user, uint256 amount);
    event Claimed(address indexed user, uint256 amount);
    event Stopped(address indexed user, uint256 amount);
    event MiningPaused(address indexed user);
    event MiningResumed(address indexed user);
    
    constructor(address _tokenAddress) Ownable(msg.sender) {
        loveToken = IERC20(_tokenAddress);
    }
    
    function startMining(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Cannot mine with 0");
        require(loveToken.transferFrom(msg.sender, address(this), _amount), "Transfer failed");
        
        MinerInfo storage miner = miners[msg.sender];
        
        // If already mining, claim pending rewards first
        if (miner.amount > 0 && !miner.isPaused) {
            _claimRewards();
        }
        
        miner.amount += _amount;
        miner.lastClaimTime = block.timestamp;
        miner.isPaused = false;
        
        emit Started(msg.sender, _amount);
    }
    
    function toggleMining() external nonReentrant {
        MinerInfo storage miner = miners[msg.sender];
        require(miner.amount > 0, "Not mining");
        
        if (!miner.isPaused) {
            // Claim rewards before pausing
            _claimRewards();
            miner.isPaused = true;
            emit MiningPaused(msg.sender);
        } else {
            miner.isPaused = false;
            miner.lastClaimTime = block.timestamp;
            emit MiningResumed(msg.sender);
        }
    }
    
    function stopMining() external nonReentrant {
        MinerInfo storage miner = miners[msg.sender];
        require(miner.amount > 0, "Not mining");
        
        // Claim any pending rewards first if not paused
        if (!miner.isPaused) {
            _claimRewards();
        }
        
        uint256 amount = miner.amount;
        miner.amount = 0;
        miner.lastClaimTime = 0;
        miner.isPaused = false;
        
        require(loveToken.transfer(msg.sender, amount), "Transfer failed");
        
        emit Stopped(msg.sender, amount);
    }
    
    function claimRewards() external nonReentrant {
        _claimRewards();
    }
    
    function _claimRewards() internal {
        MinerInfo storage miner = miners[msg.sender];
        require(miner.amount > 0, "Not mining");
        require(!miner.isPaused, "Mining is paused");
        
        uint256 timeElapsed = block.timestamp - miner.lastClaimTime;
        uint256 rewards = (miner.amount * APY * timeElapsed) / (365 days);
        
        miner.lastClaimTime = block.timestamp;
        
        require(loveToken.transfer(msg.sender, rewards), "Transfer failed");
        
        emit Claimed(msg.sender, rewards);
    }
    
    function getMinerInfo(address _user) external view returns (
        uint256 minedAmount,
        uint256 lastClaimTime,
        uint256 pendingRewards,
        bool isPaused
    ) {
        MinerInfo memory miner = miners[_user];
        
        uint256 rewards = 0;
        if (miner.amount > 0 && !miner.isPaused) {
            uint256 timeElapsed = block.timestamp - miner.lastClaimTime;
            rewards = (miner.amount * APY * timeElapsed) / (365 days);
        }
        
        return (
            miner.amount,
            miner.lastClaimTime,
            rewards,
            miner.isPaused
        );
    }
}