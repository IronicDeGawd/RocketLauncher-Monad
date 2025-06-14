// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RocketCandle
 * @dev Main contract for storing game results and managing server access
 */
contract RocketCandle is ReentrancyGuard, Pausable, Ownable {
    struct GameResult {
        address player;
        uint256 timestamp;
        string period;
        uint16 score;
    }

    GameResult[] public results;
    address public server;

    // Mapping for efficient player result queries
    mapping(address => uint256[]) private playerResultIndices;

    event ResultRecorded(address indexed player, uint16 score, string period, uint256 timestamp);
    event ServerUpdated(address indexed oldServer, address indexed newServer);

    modifier onlyServer() {
        require(msg.sender == server, "Only authorized server can call this function");
        _;
    }

    modifier validAddress(address _addr) {
        require(_addr != address(0), "Invalid address");
        _;
    }

    constructor(address _initialServer) Ownable(msg.sender) validAddress(_initialServer) {
        server = _initialServer;
    }

    /**
     * @dev Record a game result (only callable by authorized server)
     * @param _player Player address
     * @param _score Score achieved
     * @param _period Game period/level identifier
     */
    function recordResult(
        address _player,
        uint16 _score,
        string memory _period
    ) external onlyServer nonReentrant whenNotPaused validAddress(_player) {
        require(_score > 0, "Score must be greater than 0");
        require(bytes(_period).length > 0, "Period cannot be empty");

        uint256 index = results.length;
        results.push(GameResult(_player, block.timestamp, _period, _score));
        playerResultIndices[_player].push(index);

        emit ResultRecorded(_player, _score, _period, block.timestamp);
    }

    /**
     * @dev Get player's game results
     * @param _player Player address
     * @return Array of player's game results
     */
    function getPlayerResults(address _player) external view validAddress(_player) returns (GameResult[] memory) {
        uint256[] memory indices = playerResultIndices[_player];
        GameResult[] memory playerResults = new GameResult[](indices.length);

        for (uint256 i = 0; i < indices.length; i++) {
            playerResults[i] = results[indices[i]];
        }

        return playerResults;
    }

    /**
     * @dev Get leaderboard (top N scores)
     * @param _limit Number of top scores to return
     * @return Array of top game results
     */
    function getLeaderboard(uint256 _limit) external view returns (GameResult[] memory) {
        uint256 totalResults = results.length;
        if (totalResults == 0) {
            return new GameResult[](0);
        }

        uint256 limit = _limit > totalResults ? totalResults : _limit;
        GameResult[] memory leaderboard = new GameResult[](limit);

        // Simple implementation - return most recent results
        // In production, you'd want to sort by score
        for (uint256 i = 0; i < limit; i++) {
            leaderboard[i] = results[totalResults - 1 - i];
        }

        return leaderboard;
    }

    /**
     * @dev Update authorized server address (only owner)
     * @param _newServer New server address
     */
    function updateServer(address _newServer) external onlyOwner validAddress(_newServer) {
        require(_newServer != server, "Same server address");

        address oldServer = server;
        server = _newServer;

        emit ServerUpdated(oldServer, _newServer);
    }

    /**
     * @dev Get total number of results
     * @return Total number of game results
     */
    function getTotalResults() external view returns (uint256) {
        return results.length;
    }

    /**
     * @dev Get player's total number of results
     * @param _player Player address
     * @return Number of results for the player
     */
    function getPlayerResultCount(address _player) external view validAddress(_player) returns (uint256) {
        return playerResultIndices[_player].length;
    }

    /**
     * @dev Pause contract (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause contract (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Get a specific result by index
     * @param _index Index of the result
     * @return GameResult at the specified index
     */
    function getResult(uint256 _index) external view returns (GameResult memory) {
        require(_index < results.length, "Index out of range");
        return results[_index];
    }
}
