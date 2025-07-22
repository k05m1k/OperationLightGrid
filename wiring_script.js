require("dotenv").config();
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  const sentinel = await hre.ethers.getContractAt("SentinelToken", process.env.SENTINEL_TOKEN);
  const questClaim = await hre.ethers.getContractAt("QuestClaim", process.env.QUEST_CLAIM);
  const registry = await hre.ethers.getContractAt("QuestRegistry", process.env.QUEST_REGISTRY);

  const MINTER_ROLE = await sentinel.MINTER_ROLE();
  const CLAIM_VERIFIER_ROLE = await questClaim.CLAIM_VERIFIER_ROLE();
  const QUEST_CREATOR_ROLE = await registry.QUEST_CREATOR_ROLE();
  const QUEST_EXECUTOR_ROLE = await registry.QUEST_EXECUTOR_ROLE();

  // Wire roles
  if (!(await sentinel.hasRole(MINTER_ROLE, questClaim.address))) {
    await sentinel.grantRole(MINTER_ROLE, questClaim.address);
    console.log("✅ Granted MINTER_ROLE to QuestClaim");
  }

  if (!(await questClaim.hasRole(CLAIM_VERIFIER_ROLE, registry.address))) {
    await questClaim.grantRole(CLAIM_VERIFIER_ROLE, registry.address);
    console.log("✅ Granted CLAIM_VERIFIER_ROLE to Registry");
  }

  if (!(await registry.hasRole(QUEST_CREATOR_ROLE, deployer.address))) {
    await registry.grantRole(QUEST_CREATOR_ROLE, deployer.address);
    console.log("✅ Granted QUEST_CREATOR_ROLE to deployer");
  }

  if (!(await registry.hasRole(QUEST_EXECUTOR_ROLE, deployer.address))) {
    await registry.grantRole(QUEST_EXECUTOR_ROLE, deployer.address);
    console.log("✅ Granted QUEST_EXECUTOR_ROLE to deployer");
  }

  // Link XP Emitter
  const currentEmitter = await registry.xpEmitter();
  if (currentEmitter !== questClaim.address) {
    await registry.setXPEmitter(questClaim.address);
    console.log("🔗 Linked QuestClaim as XPEmitter in QuestRegistry");
  }

  console.log("🎯 Wiring complete and validated.");
}

main().catch((err) => {
  console.error("❌ Wiring failed:", err);
  process.exitCode = 1;
});