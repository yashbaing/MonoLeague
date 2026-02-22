/**
 * Complete contest(s) so winners can claim prizes.
 * Call this after scores are submitted (status = Scored).
 * Usage: npm run complete-contest
 *   or:  CONTEST_ADDRESS=0x... npm run complete-contest  (single contest)
 */
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

const STATUS = { Open: 0, Locked: 1, Scored: 2, Completed: 3 };

async function main() {
  const addressesPath = path.join(__dirname, "../deployed-addresses.json");
  if (!fs.existsSync(addressesPath)) {
    console.error("Run deploy and seed first: npm run deploy:seed");
    process.exit(1);
  }
  const { contestFactory } = JSON.parse(
    fs.readFileSync(addressesPath, "utf8")
  );

  const ContestFactory = await hre.ethers.getContractAt(
    "ContestFactory",
    contestFactory
  );

  let contestAddresses = [];
  if (process.env.CONTEST_ADDRESS) {
    contestAddresses = [process.env.CONTEST_ADDRESS];
    console.log("Using CONTEST_ADDRESS:", process.env.CONTEST_ADDRESS);
  } else {
    contestAddresses = await ContestFactory.getContests();
    console.log("Found", contestAddresses.length, "contest(s) from factory.");
  }

  for (const addr of contestAddresses) {
    const Contest = await hre.ethers.getContractAt("Contest", addr);
    const status = await Contest.status();
    const matchId = await Contest.matchId();

    if (Number(status) === STATUS.Completed) {
      console.log("Contest", addr, "(match", matchId.toString() + ") already Completed. Skip.");
      continue;
    }
    if (Number(status) !== STATUS.Scored) {
      console.log("Contest", addr, "(match", matchId.toString() + ") status is", status, "- not Scored. Run lock + submitScores first.");
      continue;
    }

    console.log("Completing contest", addr, "(match", matchId.toString() + ")...");
    const tx = await Contest.completeContest();
    await tx.wait();
    console.log("Completed. Winners can now claim prizes.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
