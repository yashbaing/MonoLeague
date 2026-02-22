// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Contest.sol";

/**
 * @title ContestFactory
 * @dev Deploys new Contest instances and tracks them
 */
contract ContestFactory {
    address public admin;
    address public playerRegistry;

    address[] public contests;

    event ContestCreated(
        address indexed contest,
        uint256 matchId,
        uint256 entryFee,
        uint256 deadline
    );

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    constructor(address _playerRegistry) {
        admin = msg.sender;
        playerRegistry = _playerRegistry;
    }

    function createContest(
        uint256 matchId,
        uint256 entryFee,
        uint256 deadline,
        uint256 maxEntries,
        uint256[] calldata prizePercentages,
        uint256 firstPrizeAmount
    ) external onlyAdmin returns (address) {
        Contest c = new Contest(
            admin,
            playerRegistry,
            matchId,
            entryFee,
            deadline,
            maxEntries,
            prizePercentages,
            firstPrizeAmount
        );
        contests.push(address(c));
        emit ContestCreated(address(c), matchId, entryFee, deadline);
        return address(c);
    }

    function getContests() external view returns (address[] memory) {
        return contests;
    }

    function getContestCount() external view returns (uint256) {
        return contests.length;
    }
}
