require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  if (!deployer) {
    console.error(
      "No deployer account. Add PRIVATE_KEY to contracts/.env\n" +
      "  Example: PRIVATE_KEY=0xYourPrivateKeyHex\n" +
      "  Get testnet MON from faucet to pay gas."
    );
    process.exit(1);
  }
  console.log("Deploying with account:", deployer.address);

  // 1. Deploy PlayerRegistry
  const PlayerRegistry = await hre.ethers.getContractFactory("PlayerRegistry");
  const playerRegistry = await PlayerRegistry.deploy();
  await playerRegistry.waitForDeployment();
  const playerRegistryAddr = await playerRegistry.getAddress();
  console.log("PlayerRegistry deployed to:", playerRegistryAddr);

  // 2. Deploy ContestFactory
  const ContestFactory = await hre.ethers.getContractFactory("ContestFactory");
  const contestFactory = await ContestFactory.deploy(playerRegistryAddr);
  await contestFactory.waitForDeployment();
  const contestFactoryAddr = await contestFactory.getAddress();
  console.log("ContestFactory deployed to:", contestFactoryAddr);

  const addresses = {
    playerRegistry: playerRegistryAddr,
    contestFactory: contestFactoryAddr,
  };

  const outPath = path.join(__dirname, "../deployed-addresses.json");
  fs.writeFileSync(outPath, JSON.stringify(addresses, null, 2));
  console.log("\nAddresses written to contracts/deployed-addresses.json");

  console.log("\n--- Deployment Summary ---");
  console.log("PlayerRegistry:", playerRegistryAddr);
  console.log("ContestFactory:", contestFactoryAddr);
  console.log("\nCopy these to src/contracts/addresses.ts after seed script.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
