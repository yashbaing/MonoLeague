/**
 * For match 2 (MI vs CSK): submit scores and complete contest so winners can claim.
 * Use when contest is Locked (deadline passed, lockContest already called).
 * If contest is Scored, only completes. If Open, run after deadline then run complete-contest.
 *
 * Usage: CONTEST_ADDRESS=0x... npm run score-and-complete
 *   or set CONTEST_ADDRESS in .env
 */
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

const STATUS = { Open: 0, Locked: 1, Scored: 2, Completed: 3 };

// Match 2 scorecard: playerId => fantasy points (must match Contest's playerRegistry for match 2)
const MATCH_2_PLAYER_POINTS = [
  [201, 73], [202, 36], [203, 42], [204, 47], [205, 50], [206, 78], [207, 34], [208, 66],
  [209, 31], [210, 83], [211, 25], [212, 54], [213, 12], [214, 40], [215, 8],
];

async function main() {
  const contestAddress = process.env.CONTEST_ADDRESS;
  if (!contestAddress) {
    console.error("Set CONTEST_ADDRESS (contest to score and complete).");
    process.exit(1);
  }

  const Contest = await hre.ethers.getContractAt("Contest", contestAddress);
  const matchId = await Contest.matchId();
  const status = await Contest.status();
  const statusNum = Number(status);

  if (statusNum === STATUS.Completed) {
    console.log("Contest already Completed. Winners can claim.");
    return;
  }

  if (statusNum === STATUS.Scored) {
    console.log("Contest is Scored. Completing...");
    const tx = await Contest.completeContest();
    await tx.wait();
    console.log("Completed. Winners can now claim.");
    return;
  }

  if (statusNum === STATUS.Locked) {
    const playerIds = MATCH_2_PLAYER_POINTS.map(([id]) => id);
    const points = MATCH_2_PLAYER_POINTS.map(([, p]) => p);
    if (Number(matchId) !== 2) {
      console.error("This script uses match 2 scorecard. Contest matchId is", matchId.toString());
      process.exit(1);
    }
    console.log("Submitting scores for", playerIds.length, "players...");
    const tx1 = await Contest.submitScores(playerIds, points);
    await tx1.wait();
    console.log("Scores submitted. Completing...");
    const tx2 = await Contest.completeContest();
    await tx2.wait();
    console.log("Completed. Winners can now claim.");
    return;
  }

  if (statusNum === STATUS.Open) {
    console.error("Contest is still Open. Lock it first (run after deadline): call lockContest() then run this script again.");
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
