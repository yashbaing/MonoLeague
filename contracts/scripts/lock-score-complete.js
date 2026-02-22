/**
 * For a contest: lock (if deadline passed), submit scores (match 2 only), then complete.
 * So winners can claim. Run after deploy:seed (seed uses past deadline so lock works).
 *
 * Usage: npm run lock-score-complete
 *   Completes all contests that are Open/Locked/Scored.
 *   Match 2: uses hardcoded scorecard. Match 1: only lock+complete if already Scored.
 */
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

const STATUS = { Open: 0, Locked: 1, Scored: 2, Completed: 3 };

const MATCH_2_PLAYER_POINTS = [
  [201, 73], [202, 36], [203, 42], [204, 47], [205, 50], [206, 78], [207, 34], [208, 66],
  [209, 31], [210, 83], [211, 25], [212, 54], [213, 12], [214, 40], [215, 8],
];

async function main() {
  const addressesPath = path.join(__dirname, "../deployed-addresses.json");
  if (!fs.existsSync(addressesPath)) {
    console.error("Run deploy and seed first: npm run deploy:seed");
    process.exit(1);
  }
  const { contestFactory } = JSON.parse(
    fs.readFileSync(addressesPath, "utf8")
  );
  const ContestFactory = await hre.ethers.getContractAt("ContestFactory", contestFactory);
  const addresses = await ContestFactory.getContests();

  for (const addr of addresses) {
    const Contest = await hre.ethers.getContractAt("Contest", addr);
    const matchId = (await Contest.matchId()).toString();
    let status = Number(await Contest.status());

    if (status === STATUS.Completed) {
      console.log("Contest", addr, "(match", matchId + ") already Completed.");
      continue;
    }

    if (status === STATUS.Open) {
      console.log("Locking contest", addr, "(match", matchId + ")...");
      try {
        const tx = await Contest.lockContest();
        await tx.wait();
        status = STATUS.Locked;
        console.log("Locked.");
      } catch (e) {
        console.log("Lock failed (deadline not passed?):", e.message);
        continue;
      }
    }

    if (status === STATUS.Locked) {
      if (matchId === "2") {
        const playerIds = MATCH_2_PLAYER_POINTS.map(([id]) => id);
        const points = MATCH_2_PLAYER_POINTS.map(([, p]) => p);
        console.log("Submitting scores for match 2...");
        const tx = await Contest.submitScores(playerIds, points);
        await tx.wait();
        console.log("Scores submitted.");
      } else {
        console.log("Match", matchId, ": no scorecard in script. Skip submitScores.");
        continue;
      }
    }

    if (Number(await Contest.status()) === STATUS.Scored) {
      console.log("Completing contest", addr, "...");
      const tx = await Contest.completeContest();
      await tx.wait();
      console.log("Completed. Winners can claim.");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
