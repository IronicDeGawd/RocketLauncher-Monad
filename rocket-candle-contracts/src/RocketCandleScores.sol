// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title RocketCandleScores
 * @dev Smart contract for storing game scores on Monad blockchain
 */
contract RocketCandleScores {
    struct Score {
        address player;
        uint16 level;
        uint256 score;
        uint256 timestamp;
    }

    Score[] public scores;
    address public owner;

    event ScoreSubmitted(address indexed player, uint16 level, uint256 score, uint256 timestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Submit a game score
     * @param _level The level completed
     * @param _score The score achieved
     */
    function submitScore(uint16 _level, uint256 _score) external {
        require(msg.sender != address(0), "Invalid address");
        require(_level > 0 && _level <= 7, "Invalid level");
        require(_score > 0, "Score must be greater than 0");

        scores.push(Score(msg.sender, _level, _score, block.timestamp));
        emit ScoreSubmitted(msg.sender, _level, _score, block.timestamp);
    }

    /**
     * @dev Get top N scores
     * @param n Number of top scores to return
     * @return Array of top scores
     */
    function getTopScores(uint256 n) external view returns (Score[] memory) {
        uint256 len = scores.length < n ? scores.length : n;
        Score[] memory top = new Score[](len);

        // Simple implementation - return most recent scores
        // In production, you'd want to sort by score
        for(uint i = 0; i < len; i++) {
            top[i] = scores[scores.length - 1 - i];
        }
        return top;
    }

    /**
     * @dev Get player's scores
     * @param player The player address
     * @return Array of player's scores
     */
    function getPlayerScores(address player) external view returns (Score[] memory) {
        uint256 count = 0;

        // Count player's scores
        for (uint256 i = 0; i < scores.length; i++) {
            if (scores[i].player == player) {
                count++;
            }
        }

        // Create array of player's scores
        Score[] memory playerScores = new Score[](count);
        uint256 index = 0;

        for (uint256 i = 0; i < scores.length; i++) {
            if (scores[i].player == player) {
                playerScores[index] = scores[i];
                index++;
            }
        }

        return playerScores;
    }

    /**
     * @dev Get total number of scores
     * @return Total number of scores submitted
     */
    function getTotalScores() external view returns (uint256) {
        return scores.length;
    }
}
