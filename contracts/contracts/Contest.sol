// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./PlayerRegistry.sol";

/**
 * @title Contest
 * @dev Single fantasy contest. Users join by paying entry fee and submitting team.
 */
contract Contest {
    PlayerRegistry public playerRegistry;

    uint256 public matchId;
    uint256 public entryFee;
    uint256 public deadline;
    uint256 public maxEntries;   // 0 = unlimited
    address public admin;

    enum Status { Open, Locked, Scored, Completed }
    Status public status;

    // prizePercentages: [50, 30, 20] = 1st 50%, 2nd 30%, 3rd 20% (used when firstPrizeAmount == 0)
    uint256[] public prizePercentages;
    uint256 public prizePool;
    /// @dev If > 0, 1st place gets this amount (capped by prizePool); remainder split 60/40 for 2nd and 3rd
    uint256 public firstPrizeAmount;

    struct Entry {
        address user;
        uint256[] playerIds;
        uint256 captainId;
        uint256 viceCaptainId;
        uint256 totalPoints;
        uint256 rank;
        bool claimed;
    }

    Entry[] public entries;
    mapping(address => uint256[]) public userEntryIndices;

    // playerId => points (set by admin after match)
    mapping(uint256 => uint256) public playerScores;

    event Joined(address indexed user, uint256 entryIndex, uint256[] playerIds, uint256 captainId, uint256 viceCaptainId);
    event ScoresSubmitted(uint256[] playerIds, uint256[] points);
    event PrizesDistributed(address[] winners);
    event Claimed(address indexed user, uint256 amount);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    constructor(
        address _admin,
        address _playerRegistry,
        uint256 _matchId,
        uint256 _entryFee,
        uint256 _deadline,
        uint256 _maxEntries,
        uint256[] memory _prizePercentages,
        uint256 _firstPrizeAmount
    ) {
        admin = _admin;
        playerRegistry = PlayerRegistry(_playerRegistry);
        matchId = _matchId;
        entryFee = _entryFee;
        deadline = _deadline;
        maxEntries = _maxEntries;
        firstPrizeAmount = _firstPrizeAmount;

        require(_prizePercentages.length > 0, "Need prize breakdown");
        uint256 total = 0;
        for (uint256 i = 0; i < _prizePercentages.length; i++) {
            total += _prizePercentages[i];
        }
        require(total == 100, "Prize percentages must sum to 100");
        prizePercentages = _prizePercentages;
    }

    /// @notice Pay entry fee and submit a team. Can be called multiple times per user (each call = new entry).
    function joinContest(
        uint256[] calldata playerIds,
        uint256 captainId,
        uint256 viceCaptainId
    ) external payable {
        require(status == Status.Open, "Contest not open");
        require(block.timestamp < deadline, "Deadline passed");
        require(msg.value >= entryFee, "Insufficient entry fee");
        require(
            maxEntries == 0 || entries.length < maxEntries,
            "Contest full"
        );

        _validateTeam(playerIds, captainId, viceCaptainId);

        uint256 idx = entries.length;
        entries.push(Entry({
            user: msg.sender,
            playerIds: playerIds,
            captainId: captainId,
            viceCaptainId: viceCaptainId,
            totalPoints: 0,
            rank: 0,
            claimed: false
        }));
        userEntryIndices[msg.sender].push(idx);
        prizePool += entryFee;

        if (msg.value > entryFee) {
            (bool ok,) = payable(msg.sender).call{value: msg.value - entryFee}("");
            require(ok, "Refund failed");
        }

        emit Joined(msg.sender, idx, playerIds, captainId, viceCaptainId);
    }

    function _validateTeam(
        uint256[] calldata playerIds,
        uint256 captainId,
        uint256 viceCaptainId
    ) internal view {
        require(playerIds.length == 11, "Must have 11 players");
        require(captainId != viceCaptainId, "C and VC must differ");

        bool hasCaptain;
        bool hasViceCaptain;
        uint256 totalCredit = 0;
        uint8 wkCount = 0;
        uint8 batCount = 0;
        uint8 arCount = 0;
        uint8 bowCount = 0;
        uint8 teamACount = 0;
        uint8 teamBCount = 0;

        for (uint256 i = 0; i < playerIds.length; i++) {
            uint256 pid = playerIds[i];
            PlayerRegistry.Player memory p = playerRegistry.getPlayer(matchId, pid);
            require(p.credit > 0, "Invalid player");

            if (pid == captainId) hasCaptain = true;
            if (pid == viceCaptainId) hasViceCaptain = true;

            totalCredit += p.credit;

            if (p.role == PlayerRegistry.Role.WK) wkCount++;
            else if (p.role == PlayerRegistry.Role.BAT) batCount++;
            else if (p.role == PlayerRegistry.Role.AR) arCount++;
            else if (p.role == PlayerRegistry.Role.BOWL) bowCount++;

            if (p.teamId == 0) teamACount++;
            else if (p.teamId == 1) teamBCount++;
        }

        require(hasCaptain && hasViceCaptain, "C and VC must be in team");
        require(totalCredit <= 100, "Budget exceeded");
        require(wkCount >= 1, "Need at least 1 WK");
        require(batCount >= 1 && batCount <= 8, "Need 1-8 BAT");
        require(arCount >= 1 && arCount <= 8, "Need 1-8 AR");
        require(bowCount >= 1 && bowCount <= 8, "Need 1-8 BOWL");
        require(teamACount <= 10 && teamBCount <= 10, "Max 10 from one team");
    }

    function lockContest() external onlyAdmin {
        require(status == Status.Open, "Already locked");
        require(block.timestamp >= deadline, "Deadline not passed");
        status = Status.Locked;
    }

    function submitScores(uint256[] calldata playerIds, uint256[] calldata points) external onlyAdmin {
        require(status == Status.Locked, "Must lock first");
        require(playerIds.length == points.length, "Length mismatch");

        for (uint256 i = 0; i < playerIds.length; i++) {
            playerScores[playerIds[i]] = points[i];
        }

        for (uint256 i = 0; i < entries.length; i++) {
            Entry storage e = entries[i];
            e.totalPoints = _calculateTeamPoints(e.playerIds, e.captainId, e.viceCaptainId);
        }

        _rankTeams();
        status = Status.Scored;
        emit ScoresSubmitted(playerIds, points);
    }

    function _calculateTeamPoints(
        uint256[] memory playerIds,
        uint256 captainId,
        uint256 viceCaptainId
    ) internal view returns (uint256 total) {
        for (uint256 i = 0; i < playerIds.length; i++) {
            uint256 pts = playerScores[playerIds[i]];
            if (playerIds[i] == captainId) pts = pts * 2;
            else if (playerIds[i] == viceCaptainId) pts = pts * 3 / 2; // 1.5x
            total += pts;
        }
        return total;
    }

    function _rankTeams() internal {
        uint256 n = entries.length;
        for (uint256 r = 1; r <= n; r++) {
            uint256 bestIdx = type(uint256).max;
            uint256 bestPts = 0;
            for (uint256 i = 0; i < n; i++) {
                if (entries[i].rank == 0 && entries[i].totalPoints > bestPts) {
                    bestPts = entries[i].totalPoints;
                    bestIdx = i;
                }
            }
            if (bestIdx != type(uint256).max) {
                entries[bestIdx].rank = r;
            }
        }
    }

    function completeContest() external onlyAdmin {
        require(status == Status.Scored, "Must score first");
        status = Status.Completed;
    }

    /// @param entryIndex Index of the entry (from userEntryIndices or getLeaderboard)
    function claimPrize(uint256 entryIndex) external {
        require(status == Status.Completed, "Contest not completed");
        require(entryIndex < entries.length, "Invalid entry");
        Entry storage e = entries[entryIndex];
        require(e.user == msg.sender, "Not your entry");
        require(e.rank > 0, "No rank");
        require(!e.claimed, "Already claimed");

        uint256 amount = _prizeForRank(e.rank);
        require(amount > 0, "No prize for this rank");

        e.claimed = true;

        (bool ok,) = payable(msg.sender).call{value: amount}("");
        require(ok, "Transfer failed");
        emit Claimed(msg.sender, amount);
    }

    function _prizeForRank(uint256 rank) internal view returns (uint256) {
        if (rank > 3) return 0;
        if (firstPrizeAmount > 0) {
            if (rank == 1) {
                return firstPrizeAmount <= prizePool ? firstPrizeAmount : prizePool;
            }
            uint256 firstAmount = firstPrizeAmount <= prizePool ? firstPrizeAmount : prizePool;
            uint256 remainder = prizePool - firstAmount;
            if (rank == 2) return remainder * 60 / 100;
            if (rank == 3) return remainder * 40 / 100;
            return 0;
        }
        if (rank > prizePercentages.length) return 0;
        return prizePool * prizePercentages[rank - 1] / 100;
    }

    function getLeaderboard() external view returns (
        address[] memory users,
        uint256[] memory points,
        uint256[] memory ranks,
        uint256[] memory entryIndices
    ) {
        uint256 n = entries.length;
        users = new address[](n);
        points = new uint256[](n);
        ranks = new uint256[](n);
        entryIndices = new uint256[](n);

        if (n == 0) return (users, points, ranks, entryIndices);

        for (uint256 i = 0; i < n; i++) {
            users[i] = entries[i].user;
            points[i] = entries[i].totalPoints;
            ranks[i] = entries[i].rank;
            entryIndices[i] = i;
        }

        for (uint256 i = 0; i < n - 1; i++) {
            for (uint256 j = i + 1; j < n; j++) {
                if (ranks[j] < ranks[i] || (ranks[j] == ranks[i] && points[j] > points[i])) {
                    (users[i], users[j]) = (users[j], users[i]);
                    (points[i], points[j]) = (points[j], points[i]);
                    (ranks[i], ranks[j]) = (ranks[j], ranks[i]);
                    (entryIndices[i], entryIndices[j]) = (entryIndices[j], entryIndices[i]);
                }
            }
        }
    }

    function getTeamByEntry(uint256 entryIndex) external view returns (
        address user,
        uint256[] memory playerIds,
        uint256 captainId,
        uint256 viceCaptainId,
        uint256 totalPoints,
        uint256 rank
    ) {
        require(entryIndex < entries.length, "Invalid entry");
        Entry storage e = entries[entryIndex];
        return (e.user, e.playerIds, e.captainId, e.viceCaptainId, e.totalPoints, e.rank);
    }

    function getEntryCount() external view returns (uint256) {
        return entries.length;
    }

    receive() external payable {}
}
