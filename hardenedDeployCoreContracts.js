const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  // Replace this with your actual Gnosis Safe address
  const daoExecutor = "0xYourGnosisSafeAddressHere";
  if (!daoExecutor || daoExecutor === ethers.constants.AddressZero) {
    throw new Error("Gnosis Safe DAO address is required before deployment.");
  }

  console.log("Deploying contracts from:", deployer.address);
  const deployed = {};
  const rolesAudit = [];

  // Deploy WUNToken
  const WUNToken = await hre.ethers.getContractFactory("WUNToken");
  const wun = await WUNToken.deploy();
  await wun.deployed();
  deployed.WUNToken = wun.address;
  console.log("✅ WUNToken deployed at:", wun.address);

  // Deploy SentinelToken
  const SentinelToken = await hre.ethers.getContractFactory("SentinelToken");
  const sentinel = await SentinelToken.deploy();
  await sentinel.deployed();
  deployed.SentinelToken = sentinel.address;
  console.log("✅ SentinelToken deployed at:", sentinel.address);

  // Deploy QuestClaim linked to SentinelToken
  const QuestClaim = await hre.ethers.getContractFactory("QuestClaim");
  const quest = await QuestClaim.deploy(sentinel.address);
  await quest.deployed();
  deployed.QuestClaim = quest.address;
  console.log("✅ QuestClaim deployed at:", quest.address);

  // Grant MINTER_ROLE to QuestClaim on SentinelToken
  const MINTER_ROLE = await sentinel.MINTER_ROLE();
  await sentinel.grantRole(MINTER_ROLE, quest.address);
  rolesAudit.push({ contract: "SentinelToken", role: "MINTER_ROLE", grantedTo: quest.address });
  console.log("🔗 MINTER_ROLE granted to QuestClaim");

  // Grant CLAIM_VERIFIER_ROLE to DAO executor on QuestClaim
  const CLAIM_VERIFIER_ROLE = await quest.CLAIM_VERIFIER_ROLE();
  await quest.grantRole(CLAIM_VERIFIER_ROLE, daoExecutor);
  rolesAudit.push({ contract: "QuestClaim", role: "CLAIM_VERIFIER_ROLE", grantedTo: daoExecutor });
  console.log("🛡️ CLAIM_VERIFIER_ROLE granted to DAO Executor:", daoExecutor);

  // Revoke DEFAULT_ADMIN_ROLE from deployer in all contracts
  const DEFAULT_ADMIN_ROLE = await quest.DEFAULT_ADMIN_ROLE();

  for (const contract of [quest, sentinel, wun]) {
    await contract.revokeRole(DEFAULT_ADMIN_ROLE, deployer.address);
    console.log(`🚫 DEFAULT_ADMIN_ROLE revoked from deployer on ${contract.address}`);
  }

  rolesAudit.push({ note: "DEFAULT_ADMIN_ROLE revoked from deployer on all core contracts" });

  // Write to deployment log files
  fs.writeFileSync("deployedCoreContracts.json", JSON.stringify(deployed, null, 2));
  fs.writeFileSync("rolesAudit.json", JSON.stringify(rolesAudit, null, 2));
  console.log("📜 Deployment + Role Audit Complete");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});