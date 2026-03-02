require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// role in payload: 0=WK, 1=BAT, 2=AR, 3=BOWL

// Match 1 & 2 & 5: India vs Australia (ids 101-118)
const MATCH_1_PLAYERS = [
  { id: 101, role: 1, credit: 10, name: "R Sharma", teamId: 0 },
  { id: 102, role: 1, credit: 10, name: "V Kohli", teamId: 0 },
  { id: 103, role: 0, credit: 9, name: "R Pant", teamId: 0 },
  { id: 104, role: 2, credit: 9, name: "H Pandya", teamId: 0 },
  { id: 105, role: 3, credit: 9, name: "J Bumrah", teamId: 0 },
  { id: 111, role: 1, credit: 8, name: "S Yadav", teamId: 0 },
  { id: 112, role: 3, credit: 8, name: "K Yadav", teamId: 0 },
  { id: 113, role: 2, credit: 8, name: "R Jadeja", teamId: 0 },
  { id: 114, role: 1, credit: 8, name: "S Iyer", teamId: 0 },
  { id: 106, role: 1, credit: 9, name: "D Warner", teamId: 1 },
  { id: 107, role: 1, credit: 9, name: "S Smith", teamId: 1 },
  { id: 108, role: 0, credit: 8, name: "A Carey", teamId: 1 },
  { id: 109, role: 2, credit: 9, name: "M Marsh", teamId: 1 },
  { id: 110, role: 3, credit: 9, name: "P Cummins", teamId: 1 },
  { id: 115, role: 3, credit: 8, name: "M Starc", teamId: 1 },
  { id: 116, role: 1, credit: 8, name: "M Labuschagne", teamId: 1 },
  { id: 117, role: 1, credit: 8, name: "T Head", teamId: 1 },
  { id: 118, role: 2, credit: 7, name: "C Green", teamId: 1 },
];

// Match 2: India vs Australia (same as 1 for seed; frontend uses same squad)
const MATCH_2_PLAYERS = MATCH_1_PLAYERS;

// Match 3: India vs England (301-318)
const MATCH_3_PLAYERS = [
  { id: 301, role: 1, credit: 10, name: "R Sharma", teamId: 0 },
  { id: 302, role: 1, credit: 10, name: "V Kohli", teamId: 0 },
  { id: 303, role: 0, credit: 9, name: "R Pant", teamId: 0 },
  { id: 304, role: 2, credit: 9, name: "H Pandya", teamId: 0 },
  { id: 305, role: 3, credit: 9, name: "J Bumrah", teamId: 0 },
  { id: 306, role: 1, credit: 8, name: "S Yadav", teamId: 0 },
  { id: 307, role: 3, credit: 8, name: "K Yadav", teamId: 0 },
  { id: 308, role: 2, credit: 8, name: "R Jadeja", teamId: 0 },
  { id: 309, role: 1, credit: 8, name: "S Iyer", teamId: 0 },
  { id: 310, role: 1, credit: 10, name: "J Root", teamId: 1 },
  { id: 311, role: 0, credit: 9, name: "J Bairstow", teamId: 1 },
  { id: 312, role: 2, credit: 10, name: "B Stokes", teamId: 1 },
  { id: 313, role: 1, credit: 9, name: "J Buttler", teamId: 1 },
  { id: 314, role: 3, credit: 8, name: "M Wood", teamId: 1 },
  { id: 315, role: 3, credit: 9, name: "A Rashid", teamId: 1 },
  { id: 316, role: 3, credit: 9, name: "J Archer", teamId: 1 },
  { id: 317, role: 2, credit: 8, name: "L Livingstone", teamId: 1 },
  { id: 318, role: 1, credit: 7, name: "P Salt", teamId: 1 },
];

// Match 4: Australia vs South Africa (401-418)
const MATCH_4_PLAYERS = [
  { id: 401, role: 1, credit: 10, name: "D Warner", teamId: 0 },
  { id: 402, role: 1, credit: 9, name: "T Head", teamId: 0 },
  { id: 403, role: 2, credit: 9, name: "M Marsh", teamId: 0 },
  { id: 404, role: 3, credit: 9, name: "P Cummins", teamId: 0 },
  { id: 405, role: 0, credit: 8, name: "A Carey", teamId: 0 },
  { id: 406, role: 3, credit: 8, name: "M Starc", teamId: 0 },
  { id: 407, role: 1, credit: 8, name: "S Smith", teamId: 0 },
  { id: 408, role: 2, credit: 7, name: "C Green", teamId: 0 },
  { id: 409, role: 3, credit: 8, name: "J Hazlewood", teamId: 0 },
  { id: 410, role: 0, credit: 9, name: "Q de Kock", teamId: 1 },
  { id: 411, role: 1, credit: 9, name: "H Klaasen", teamId: 1 },
  { id: 412, role: 2, credit: 9, name: "A Markram", teamId: 1 },
  { id: 413, role: 3, credit: 9, name: "K Rabada", teamId: 1 },
  { id: 414, role: 3, credit: 8, name: "K Maharaj", teamId: 1 },
  { id: 415, role: 1, credit: 8, name: "D Miller", teamId: 1 },
  { id: 416, role: 2, credit: 8, name: "M Jansen", teamId: 1 },
  { id: 417, role: 1, credit: 7, name: "T Bavuma", teamId: 1 },
  { id: 418, role: 3, credit: 8, name: "A Nortje", teamId: 1 },
];

// Match 5: India vs Australia (same as 1)
const MATCH_5_PLAYERS = MATCH_1_PLAYERS;

// Match 6: Bangladesh vs New Zealand (601-618)
const MATCH_6_PLAYERS = [
  { id: 601, role: 1, credit: 9, name: "L Das", teamId: 0 },
  { id: 602, role: 2, credit: 9, name: "S Hasan", teamId: 0 },
  { id: 603, role: 0, credit: 8, name: "M Rahim", teamId: 0 },
  { id: 604, role: 3, credit: 9, name: "T Ahmed", teamId: 0 },
  { id: 605, role: 1, credit: 8, name: "N Hossain", teamId: 0 },
  { id: 606, role: 3, credit: 8, name: "M Rahman", teamId: 0 },
  { id: 607, role: 1, credit: 7, name: "M Haque", teamId: 0 },
  { id: 608, role: 3, credit: 8, name: "T Islam", teamId: 0 },
  { id: 609, role: 1, credit: 7, name: "S Sarkar", teamId: 0 },
  { id: 610, role: 1, credit: 10, name: "K Williamson", teamId: 1 },
  { id: 611, role: 3, credit: 9, name: "T Boult", teamId: 1 },
  { id: 612, role: 1, credit: 9, name: "D Conway", teamId: 1 },
  { id: 613, role: 2, credit: 8, name: "M Santner", teamId: 1 },
  { id: 614, role: 3, credit: 8, name: "L Ferguson", teamId: 1 },
  { id: 615, role: 1, credit: 8, name: "G Phillips", teamId: 1 },
  { id: 616, role: 0, credit: 8, name: "T Latham", teamId: 1 },
  { id: 617, role: 2, credit: 7, name: "J Neesham", teamId: 1 },
  { id: 618, role: 3, credit: 7, name: "M Henry", teamId: 1 },
];

// Match 7: Pakistan vs Zimbabwe (701-718)
const MATCH_7_PLAYERS = [
  { id: 701, role: 1, credit: 10, name: "B Azam", teamId: 0 },
  { id: 702, role: 0, credit: 9, name: "M Rizwan", teamId: 0 },
  { id: 703, role: 2, credit: 9, name: "S Khan", teamId: 0 },
  { id: 704, role: 3, credit: 9, name: "S Afridi", teamId: 0 },
  { id: 705, role: 3, credit: 8, name: "H Ali", teamId: 0 },
  { id: 706, role: 1, credit: 8, name: "I Ahmed", teamId: 0 },
  { id: 707, role: 2, credit: 7, name: "F Ashraf", teamId: 0 },
  { id: 708, role: 3, credit: 8, name: "N Shah", teamId: 0 },
  { id: 709, role: 2, credit: 7, name: "I Wasim", teamId: 0 },
  { id: 710, role: 2, credit: 9, name: "S Raza", teamId: 1 },
  { id: 711, role: 1, credit: 8, name: "C Ervine", teamId: 1 },
  { id: 712, role: 1, credit: 8, name: "S Williams", teamId: 1 },
  { id: 713, role: 3, credit: 8, name: "B Muzarabani", teamId: 1 },
  { id: 714, role: 1, credit: 7, name: "R Burl", teamId: 1 },
  { id: 715, role: 2, credit: 7, name: "W Madhevere", teamId: 1 },
  { id: 716, role: 3, credit: 7, name: "J Ball", teamId: 1 },
  { id: 717, role: 1, credit: 6, name: "M Shumba", teamId: 1 },
  { id: 718, role: 1, credit: 6, name: "T Kamunhukamwe", teamId: 1 },
];

// Match 8: England vs New Zealand (801-818)
const MATCH_8_PLAYERS = [
  { id: 801, role: 1, credit: 10, name: "J Root", teamId: 0 },
  { id: 802, role: 0, credit: 9, name: "J Bairstow", teamId: 0 },
  { id: 803, role: 2, credit: 10, name: "B Stokes", teamId: 0 },
  { id: 804, role: 3, credit: 9, name: "J Archer", teamId: 0 },
  { id: 805, role: 3, credit: 8, name: "A Rashid", teamId: 0 },
  { id: 806, role: 1, credit: 9, name: "J Buttler", teamId: 0 },
  { id: 807, role: 3, credit: 8, name: "M Wood", teamId: 0 },
  { id: 808, role: 2, credit: 8, name: "L Livingstone", teamId: 0 },
  { id: 809, role: 1, credit: 7, name: "P Salt", teamId: 0 },
  { id: 810, role: 1, credit: 10, name: "K Williamson", teamId: 1 },
  { id: 811, role: 3, credit: 9, name: "T Boult", teamId: 1 },
  { id: 812, role: 1, credit: 9, name: "D Conway", teamId: 1 },
  { id: 813, role: 2, credit: 8, name: "M Santner", teamId: 1 },
  { id: 814, role: 3, credit: 8, name: "L Ferguson", teamId: 1 },
  { id: 815, role: 1, credit: 8, name: "G Phillips", teamId: 1 },
  { id: 816, role: 0, credit: 8, name: "T Latham", teamId: 1 },
  { id: 817, role: 2, credit: 7, name: "J Neesham", teamId: 1 },
  { id: 818, role: 3, credit: 7, name: "M Henry", teamId: 1 },
];

// Match 9: Mumbai Indians vs Chennai Super Kings (201-215)
const MATCH_9_PLAYERS = [
  { id: 201, role: 1, credit: 10, name: "R Sharma", teamId: 0 },
  { id: 202, role: 0, credit: 8, name: "I Kishan", teamId: 0 },
  { id: 203, role: 1, credit: 9, name: "S Yadav", teamId: 0 },
  { id: 204, role: 2, credit: 9, name: "H Pandya", teamId: 0 },
  { id: 205, role: 3, credit: 10, name: "J Bumrah", teamId: 0 },
  { id: 206, role: 2, credit: 10, name: "R Jadeja", teamId: 1 },
  { id: 207, role: 0, credit: 9, name: "MS Dhoni", teamId: 1 },
  { id: 208, role: 1, credit: 9, name: "R Gaikwad", teamId: 1 },
  { id: 209, role: 1, credit: 8, name: "D Conway", teamId: 1 },
  { id: 210, role: 3, credit: 9, name: "M Pathirana", teamId: 1 },
  { id: 211, role: 3, credit: 8, name: "T Boult", teamId: 1 },
  { id: 212, role: 3, credit: 8, name: "K Yadav", teamId: 0 },
  { id: 213, role: 1, credit: 7, name: "T David", teamId: 0 },
  { id: 214, role: 2, credit: 8, name: "S Curran", teamId: 1 },
  { id: 215, role: 1, credit: 7, name: "N Wadhera", teamId: 0 },
];

const ALL_MATCH_PLAYERS = {
  1: MATCH_1_PLAYERS,
  2: MATCH_2_PLAYERS,
  3: MATCH_3_PLAYERS,
  4: MATCH_4_PLAYERS,
  5: MATCH_5_PLAYERS,
  6: MATCH_6_PLAYERS,
  7: MATCH_7_PLAYERS,
  8: MATCH_8_PLAYERS,
  9: MATCH_9_PLAYERS,
};

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
  const deadline = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 days
  const maxEntries = 10;
  const prizePercentagesArr = [50, 30, 20];
  const firstPrizeAmount = hre.ethers.parseEther("0.1");

  const PlayerRegistry = await hre.ethers.getContractAt(
    "PlayerRegistry",
    playerRegistry
  );
  const ContestFactory = await hre.ethers.getContractAt(
    "ContestFactory",
    contestFactory
  );

  for (let matchId = 1; matchId <= 9; matchId++) {
    const players = ALL_MATCH_PLAYERS[matchId];
    if (!players) continue;
    console.log(`Adding players for match ${matchId}...`);
    try {
      await PlayerRegistry.addPlayers(matchId, players);
      console.log(`Match ${matchId} players added.`);
    } catch (e) {
      if (e.message && e.message.includes("already")) {
        console.log(`Match ${matchId} players already set, skipping.`);
      } else {
        throw e;
      }
    }
  }

  const contestAddresses = [];

  for (let matchId = 1; matchId <= 9; matchId++) {
    console.log(`Creating contest for match ${matchId}...`);
    try {
      const tx = await ContestFactory.createContest(
        matchId,
        entryFee,
        deadline,
        maxEntries,
        prizePercentagesArr,
        firstPrizeAmount
      );
      const receipt = await tx.wait();
      const event = receipt.logs
        .map((l) => {
          try {
            return ContestFactory.interface.parseLog(l);
          } catch {
            return null;
          }
        })
        .find((e) => e?.name === "ContestCreated");
      const addr = event ? event.args[0] : null;
      if (addr) {
        contestAddresses.push(addr);
        console.log(`  Contest for match ${matchId}:`, addr);
      }
    } catch (e) {
      console.error(`  Failed to create contest for match ${matchId}:`, e.message);
    }
  }

  console.log("\nDone. Contests created:", contestAddresses.length);
  console.log("Run: node ../scripts/sync-addresses.cjs to update frontend (no change to addresses).");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
