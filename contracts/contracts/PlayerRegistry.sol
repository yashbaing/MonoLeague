// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PlayerRegistry
 * @dev On-chain registry of players for matches. Stores player IDs, roles, credits per match.
 */
contract PlayerRegistry {
    enum Role { WK, BAT, AR, BOWL }

    struct Player {
        uint256 id;
        Role role;
        uint8 credit;
        string name;      // Optional, can be empty for gas savings
        uint8 teamId;     // Real team (e.g., 0 = Team A, 1 = Team B)
    }

    address public admin;

    // matchId => playerId => Player
    mapping(uint256 => mapping(uint256 => Player)) public players;

    // matchId => list of player IDs
    mapping(uint256 => uint256[]) private _matchPlayerIds;

    // matchId => playerId => exists
    mapping(uint256 => mapping(uint256 => bool)) private _playerExists;

    event PlayersAdded(uint256 indexed matchId, uint256[] playerIds);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    /**
     * @dev Add players for a match. Overwrites existing players with same ID.
     */
    function addPlayers(uint256 matchId, Player[] calldata newPlayers) external onlyAdmin {
        for (uint256 i = 0; i < newPlayers.length; i++) {
            Player calldata p = newPlayers[i];
            require(uint8(p.role) <= 3, "Invalid role");
            require(p.credit > 0 && p.credit <= 15, "Credit must be 1-15");

            players[matchId][p.id] = Player({
                id: p.id,
                role: p.role,
                credit: p.credit,
                name: p.name,
                teamId: p.teamId
            });

            if (!_playerExists[matchId][p.id]) {
                _matchPlayerIds[matchId].push(p.id);
                _playerExists[matchId][p.id] = true;
            }
        }

        uint256[] memory ids = new uint256[](newPlayers.length);
        for (uint256 i = 0; i < newPlayers.length; i++) {
            ids[i] = newPlayers[i].id;
        }
        emit PlayersAdded(matchId, ids);
    }

    /**
     * @dev Get all player IDs for a match
     */
    function getPlayerIdsForMatch(uint256 matchId) external view returns (uint256[] memory) {
        return _matchPlayerIds[matchId];
    }

    /**
     * @dev Get player details for a match
     */
    function getPlayer(uint256 matchId, uint256 playerId) external view returns (Player memory) {
        return players[matchId][playerId];
    }

    /**
     * @dev Get players for match (batch) - returns structs
     */
    function getPlayersForMatch(uint256 matchId) external view returns (Player[] memory) {
        uint256[] memory ids = _matchPlayerIds[matchId];
        Player[] memory result = new Player[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = players[matchId][ids[i]];
        }
        return result;
    }
}
