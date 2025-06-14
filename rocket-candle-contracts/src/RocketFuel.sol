// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RocketFuel
 * @dev ERC20 token for Rocket Candle game rewards
 */
contract RocketFuel is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 1_000_000 * 10**18; // 1 million tokens

    constructor() ERC20("RocketFuel", "FUEL") Ownable(msg.sender) {
        // Mint initial supply to deployer
        _mint(msg.sender, 100_000 * 10**decimals());
    }

    /**
     * @dev Mint tokens to a specific address (only owner)
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds maximum supply");
        _mint(to, amount);
    }

    /**
     * @dev Burn tokens from a specific address (only owner)
     * @param from Address to burn tokens from
     * @param amount Amount of tokens to burn
     */
    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }

    /**
     * @dev Allow players to burn their own tokens
     * @param amount Amount of tokens to burn
     */
    function burnSelf(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
