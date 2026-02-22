/**
 * Sync deployed contract addresses from contracts/deployed-addresses.json
 * to src/contracts/addresses.ts
 */
const fs = require('fs');
const path = require('path');

const deployedPath = path.join(__dirname, '../contracts/deployed-addresses.json');
const outPath = path.join(__dirname, '../src/contracts/addresses.ts');

if (!fs.existsSync(deployedPath)) {
  console.error('Run deploy first: cd contracts && npm run deploy');
  process.exit(1);
}

const { playerRegistry, contestFactory } = JSON.parse(
  fs.readFileSync(deployedPath, 'utf8')
);

const content = `// Auto-synced from contracts/deployed-addresses.json
export const addresses = {
  playerRegistry: '${playerRegistry}' as \`0x\${string}\`,
  contestFactory: '${contestFactory}' as \`0x\${string}\`,
};
`;

fs.writeFileSync(outPath, content);
console.log('Updated src/contracts/addresses.ts with deployed addresses');
console.log('  playerRegistry:', playerRegistry);
console.log('  contestFactory:', contestFactory);
