/**
 * Create a new contest for match 2 (Mumbai vs Chennai) only.
 * Use this to "reset" match 2 — the new contest has 0 entries.
 * Requires: deploy + full seed already run once (PlayerRegistry has match 2 players).
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const hre = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
  const addressesPath = path.join(__dirname, '../deployed-addresses.json');
  if (!fs.existsSync(addressesPath)) {
    console.error('Run deploy and seed first: npm run deploy:seed');
    process.exit(1);
  }
  const { playerRegistry, contestFactory } = JSON.parse(
    fs.readFileSync(addressesPath, 'utf8')
  );

  const entryFee = hre.ethers.parseEther('0.001');
  const deadline = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
  const maxEntries = 10;
  const prizePercentagesArr = [50, 30, 20];
  const firstPrizeAmount = hre.ethers.parseEther('0.01');

  const ContestFactory = await hre.ethers.getContractAt(
    'ContestFactory',
    contestFactory
  );

  console.log('Creating new contest for match 2 (Mumbai vs Chennai)...');
  const tx = await ContestFactory.createContest(
    2,
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
    .find((e) => e?.name === 'ContestCreated');
  const newContest = event ? event.args[0] : null;
  console.log('New contest for match 2 (0 entries):', newContest);
  console.log('\nFrontend uses the latest contest per match — refresh the app.');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
