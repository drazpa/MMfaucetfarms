// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract LOVEToken is ERC20, Ownable, Pausable {
    uint256 public constant MAX_SUPPLY = 1000000000 * 10**18; // 1 billion tokens
    uint256 public constant RATE = 1000; // 1 POL = 1000 LOVE tokens (0.001 POL per LOVE)
    uint256 public mintedSupply;
    uint256 public burnedSupply;
    uint256 public circulatingSupply;
    
    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);
    event TokensPurchased(address indexed buyer, uint256 polAmount, uint256 loveAmount);
    
    constructor() ERC20("LOVE Token", "LOVE") Ownable(msg.sender) {
        // Initial supply minted to contract owner
        _mint(msg.sender, 1000000 * 10**decimals());
        mintedSupply = 1000000 * 10**decimals();
        circulatingSupply = mintedSupply;
    }
    
    function mintTokens() external payable whenNotPaused {
        require(msg.value > 0, "Must send POL");
        uint256 loveAmount = msg.value * RATE;
        require(mintedSupply + loveAmount <= MAX_SUPPLY, "Would exceed max supply");
        
        _mint(msg.sender, loveAmount);
        mintedSupply += loveAmount;
        circulatingSupply += loveAmount;
        
        emit TokensPurchased(msg.sender, msg.value, loveAmount);
        emit TokensMinted(msg.sender, loveAmount);
    }
    
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
        burnedSupply += amount;
        circulatingSupply -= amount;
        emit TokensBurned(msg.sender, amount);
    }
    
    function withdrawPol() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No POL to withdraw");
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Transfer failed");
    }
    
    function pause() public onlyOwner {
        _pause();
    }
    
    function unpause() public onlyOwner {
        _unpause();
    }
    
    function getTokenMetrics() public view returns (
        uint256 _maxSupply,
        uint256 _mintedSupply,
        uint256 _burnedSupply,
        uint256 _circulatingSupply,
        uint256 _totalSupply,
        uint256 _rate
    ) {
        return (
            MAX_SUPPLY,
            mintedSupply,
            burnedSupply,
            circulatingSupply,
            totalSupply(),
            RATE
        );
    }
    
    receive() external payable {
        revert("Use mintTokens() to purchase LOVE tokens");
    }
}