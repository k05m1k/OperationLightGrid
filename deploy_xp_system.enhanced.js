require("dotenv").config();
const fs = require("fs");
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const networkName = hre.network.name;

  console.log(`\n🚀 Deploying XP System to: ${networkName}`);
  console.log(`👤 Deployer address: ${deployer.address}\n`);

  const DEPLOYER_SAFE = process.env.DEPLOYER_SAFE || deployer.address;
  const baseURI = process.env.BASE_URI || "https://meta.xp/{id}.json";

  if (networkName === "mainnet" || networkName === "optimism") {
    if (!process.env.DEPLOYER_SAFE) throw new Error("Missing DEPLOYER_SAFE env var for mainnet deployment");
  }

  // Deploy SentinelToken
  const SentinelToken = await hre.ethers.getContractFactory("SentinelToken");
  const sentinel = await SentinelToken.deploy(baseURI, DEPLOYER_SAFE);
  await sentinel.deployed();
  console.log("✅ SentinelToken:", sentinel.address);

  // Deploy QuestClaim
  const QuestClaim = await hre.ethers.getContractFactory("QuestClaim");
  const questClaim = await QuestClaim.deploy(sentinel.address, DEPLOYER_SAFE);
  await questClaim.deployed();
  console.log("✅ QuestClaim:", questClaim.address);

  // Deploy QuestRegistry
  const QuestRegistry = await hre.ethers.getContractFactory("QuestRegistry");
  const registry = await QuestRegistry.deploy(DEPLOYER_SAFE);
  await registry.deployed();
  console.log("✅ QuestRegistry:", registry.address);

  // AccessControl roles
  const MINTER_ROLE = await sentinel.MINTER_ROLE();
  const CLAIM_VERIFIER_ROLE = await questClaim.CLAIM_VERIFIER_ROLE();
  const QUEST_CREATOR_ROLE = await registry.QUEST_CREATOR_ROLE();
  const QUEST_EXECUTOR_ROLE = await registry.QUEST_EXECUTOR_ROLE();

  // Assign roles if not already assigned
  if (!(await sentinel.hasRole(MINTER_ROLE, questClaim.address))) {
    await (await sentinel.grantRole(MINTER_ROLE, questClaim.address)).wait();
    console.log("🔐 Granted MINTER_ROLE to QuestClaim");
  }

  if (!(await questClaim.hasRole(CLAIM_VERIFIER_ROLE, registry.address))) {
    await (await questClaim.grantRole(CLAIM_VERIFIER_ROLE, registry.address)).wait();
    console.log("🔐 Granted CLAIM_VERIFIER_ROLE to QuestRegistry");
  }

  if (!(await registry.hasRole(QUEST_CREATOR_ROLE, DEPLOYER_SAFE))) {
    await (await registry.grantRole(QUEST_CREATOR_ROLE, DEPLOYER_SAFE)).wait();
    console.log("🔐 Granted QUEST_CREATOR_ROLE to deployer");
  }

  if (!(await registry.hasRole(QUEST_EXECUTOR_ROLE, DEPLOYER_SAFE))) {
    await (await registry.grantRole(QUEST_EXECUTOR_ROLE, DEPLOYER_SAFE)).wait();
    console.log("🔐 Granted QUEST_EXECUTOR_ROLE to deployer");
  }

  await (await registry.setXPEmitter(questClaim.address)).wait();
  console.log("🔗 Linked QuestClaim as XPEmitter for Registry");

  // Persist deployment
  const output = {
    network: networkName,
    deployer: deployer.address,
    baseURI,
    SentinelToken: sentinel.address,
    QuestClaim: questClaim.address,
    QuestRegistry: registry.address
  };

  const outputDir = "./deployments";
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
  fs.writeFileSync(`${outputDir}/xp-system-${networkName}.json`, JSON.stringify(output, null, 2));
  console.log("\n📝 Deployment saved to:", `${outputDir}/xp-system-${networkName}.json`);

  // Optional: renounce admin role after deploy
  if (process.env.RENOUNCE_ADMIN === "true") {
    console.log("\n⚠️ Renouncing admin roles for deployer...");
    await sentinel.renounceRole(await sentinel.DEFAULT_ADMIN_ROLE(), deployer.address);
    await questClaim.renounceRole(await questClaim.DEFAULT_ADMIN_ROLE(), deployer.address);
    await registry.renounceRole(await registry.DEFAULT_ADMIN_ROLE(), deployer.address);
    console.log("✅ Admin roles renounced");
  }

  console.log("\n✅ Deployment and DAO-safe wiring complete.");
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});