const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// Hardhat's default first account private key (Account #0)
const HARDHAT_ACCOUNT_0_PRIVATE_KEY =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

async function main() {
  console.log("Deploying contracts to local Hardhat network...\n");

  // Deploy ENService first
  const ENService = await hre.ethers.getContractFactory("ENService");
  const ensService = await ENService.deploy();
  await ensService.waitForDeployment();
  const ensAddress = await ensService.getAddress();
  console.log(`✅ ENService deployed to: ${ensAddress}`);

  // Deploy Chatzone with ENService address
  const Chatzone = await hre.ethers.getContractFactory("Chatzone");
  const chatzone = await Chatzone.deploy(ensAddress);
  await chatzone.waitForDeployment();
  const chatAddress = await chatzone.getAddress();
  console.log(`✅ Chatzone  deployed to: ${chatAddress}`);

  // Save deployed addresses to a JSON file
  const addresses = {
    ENS_CONTRACT_ADDRESS: ensAddress,
    CHAT_CONTRACT_ADDRESS: chatAddress,
  };

  const outputPath = path.join(__dirname, "..", "deployedAddresses.json");
  fs.writeFileSync(outputPath, JSON.stringify(addresses, null, 2));
  console.log(`\n📄 Addresses saved to: ${outputPath}`);

  // ── Auto-write frontend/.env ──────────────────────────────────────────
  const frontendEnvPath = path.join(__dirname, "..", "..", "frontend", ".env");
  const frontendEnv = [
    "# ──────────────────────────────────────────────────────",
    "# Note: These are automatically updated during the npm run setup process.",
    "# ──────────────────────────────────────────────────────",
    `VITE_ENS_CONTRACT_ADDRESS=${ensAddress}`,
    `VITE_CHAT_CONTRACT_ADDRESS=${chatAddress}`,
    `VITE_INFURA_RPC_URL=http://127.0.0.1:8545`,
    `VITE_RELAYER_URL=http://localhost:5000`,
    "",
  ].join("\n");
  fs.writeFileSync(frontendEnvPath, frontendEnv);
  console.log(`✅ frontend/.env written`);

  // ── Auto-write backend/.env ─────────────────────────────────────────
  const relayerEnvPath = path.join(__dirname, "..", "..", "backend", ".env");
  const relayerEnv = [
    "# ──────────────────────────────────────────────────────",
    "# Note: These are automatically updated during the npm run setup process.",
    "# ──────────────────────────────────────────────────────",
    `RPC_URL=http://127.0.0.1:8545`,
    `PRIVATE_KEY=${HARDHAT_ACCOUNT_0_PRIVATE_KEY}`,
    `ENS_CONTRACT_ADDRESS=${ensAddress}`,
    `CHAT_CONTRACT_ADDRESS=${chatAddress}`,
    `PORT=5000`,
    "",
  ].join("\n");
  fs.writeFileSync(relayerEnvPath, relayerEnv);
  console.log(`✅ backend/.env written`);

  console.log("\n🎉 Setup complete! All .env files are ready.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
