require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// Mock players for match 1 (India vs Australia)
const MATCH_1_PLAYERS = [
  { id: 101, role: 1, credit: 10, name: "R Sharma", teamId: 0 },   // BAT
  { id: 102, role: 1, credit: 10, name: "V Kohli", teamId: 0 },
  { id: 103, role: 0, credit: 9, name: "R Pant", teamId: 0 },       // WK
  { id: 104, role: 2, credit: 9, name: "H Pandya", teamId: 0 },     // AR
  { id: 105, role: 3, credit: 9, name: "J Bumrah", teamId: 0 },     // BOWL
  { id: 106, role: 1, credit: 9, name: "D Warner", teamId: 1 },
  { id: 107, role: 1, credit: 9, name: "S Smith", teamId: 1 },
  { id: 108, role: 0, credit: 8, name: "A Carey", teamId: 1 },
  { id: 109, role: 2, credit: 9, name: "M Marsh", teamId: 1 },
  { id: 110, role: 3, credit: 9, name: "P Cummins", teamId: 1 },
  { id: 111, role: 1, credit: 8, name: "S Yadav", teamId: 0 },
  { id: 112, role: 3, credit: 8, name: "K Yadav", teamId: 0 },
  { id: 113, role: 2, credit: 8, name: "R Jadeja", teamId: 0 },
  { id: 114, role: 1, credit: 8, name: "S Iyer", teamId: 0 },
  { id: 115, role: 3, credit: 8, name: "M Starc", teamId: 1 },
  { id: 116, role: 1, credit: 8, name: "M Labuschagne", teamId: 1 },
  { id: 117, role: 1, credit: 8, name: "T Head", teamId: 1 },
  { id: 118, role: 2, credit: 7, name: "C Green", teamId: 1 },
];

// Match 2: Mumbai Indians vs Chennai Super Kings (DY Patil Stadium)
const MATCH_2_PLAYERS = [
  { id: 201, role: 1, credit: 10, name: "R Sharma", teamId: 0 },   // BAT
  { id: 202, role: 0, credit: 8, name: "I Kishan", teamId: 0 },     // WK
  { id: 203, role: 1, credit: 9, name: "S Yadav", teamId: 0 },
  { id: 204, role: 2, credit: 9, name: "H Pandya", teamId: 0 },    // AR
  { id: 205, role: 3, credit: 10, name: "J Bumrah", teamId: 0 },    // BOWL
  { id: 206, role: 2, credit: 10, name: "R Jadeja", teamId: 1 },
  { id: 207, role: 0, credit: 9, name: "MS Dhoni", teamId: 1 },    // WK
  { id: 208, role: 1, credit: 9, name: "R Gaikwad", teamId: 1 },
  { id: 209, role: 1, credit: 8, name: "D Conway", teamId: 1 },
  { id: 210, role: 3, credit: 9, name: "M Pathirana", teamId: 1 }, // BOWL
  { id: 211, role: 3, credit: 8, name: "T Boult", teamId: 1 },
  { id: 212, role: 3, credit: 8, name: "K Yadav", teamId: 0 },
  { id: 213, role: 1, credit: 7, name: "T David", teamId: 0 },
  { id: 214, role: 2, credit: 8, name: "S Curran", teamId: 1 },
  { id: 215, role: 1, credit: 7, name: "N Wadhera", teamId: 0 },
];

async function main() {
  const addressesPath = path.join(__dirname, "../deployed-addresses.json");
  if (!fs.existsSync(addressesPath)) {
    console.error("Run deploy first: npm run deploy");
    process.exit(1);
  }
  const { playerRegistry, contestFactory } = JSON.parse(
    fs.readFileSync(addressesPath, "utf8")
  );

  const entryFee = hre.ethers.parseEther("0.001");
  // 7-day deadline so users can join; run lock-score-complete after deadline to close and pay winners
  const deadline = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 days
  const maxEntries = 10;

  const PlayerRegistry = await hre.ethers.getContractAt(
    "PlayerRegistry",
    playerRegistry
  );
  const ContestFactory = await hre.ethers.getContractAt(
    "ContestFactory",
    contestFactory
  );

  console.log("Adding players for match 1...");
  await PlayerRegistry.addPlayers(1, MATCH_1_PLAYERS);
  console.log("Match 1 players added.");

  console.log("Adding players for match 2 (MI vs CSK)...");
  await PlayerRegistry.addPlayers(2, MATCH_2_PLAYERS);
  console.log("Match 2 players added.");

  const prizePercentagesArr = [50, 30, 20];
  const firstPrizeAmount = hre.ethers.parseEther("0.01"); // Winner gets 0.01 MON (if prize pool >= 0.01)

  console.log("Creating contest for match 1...");
  const tx1 = await ContestFactory.createContest(
    1,
    entryFee,
    deadline,
    maxEntries,
    prizePercentagesArr,
    firstPrizeAmount
  );
  const receipt1 = await tx1.wait();
  const event1 = receipt1.logs
    .map((l) => {
      try {
        return ContestFactory.interface.parseLog(l);
      } catch {
        return null;
      }
    })
    .find((e) => e?.name === "ContestCreated");
  const contest1 = event1 ? event1.args[0] : null;
  console.log("Contest for match 1 (India vs Australia):", contest1);

  console.log("Creating contest for match 2 (MI vs CSK)...");
  const tx2 = await ContestFactory.createContest(
    2,
    entryFee,
    deadline,
    maxEntries,
    prizePercentagesArr,
    firstPrizeAmount
  );
  const receipt2 = await tx2.wait();
  const event2 = receipt2.logs
    .map((l) => {
      try {
        return ContestFactory.interface.parseLog(l);
      } catch {
        return null;
      }
    })
    .find((e) => e?.name === "ContestCreated");
  const contest2 = event2 ? event2.args[0] : null;
  console.log("Contest for match 2 (Mumbai Indians vs Chennai Super Kings):", contest2);

  console.log("\nRun: node ../scripts/sync-addresses.cjs to update frontend addresses.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
