const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);

  const deployed = {};

  // Deploy RoleRegistry
  const RoleRegistry = await hre.ethers.getContractFactory("RoleRegistry");
  const registry = await RoleRegistry.deploy();
  await registry.deployed();
  console.log("✅ RoleRegistry deployed at:", registry.address);
  deployed.RoleRegistry = registry.address;

  // Deploy ZodiacRoleAssignmentModule
  const ZodiacModule = await hre.ethers.getContractFactory("ZodiacRoleAssignmentModule");
  const daoMultisig = deployer.address; // Replace with actual Gnosis Safe address
  const zodiac = await ZodiacModule.deploy(daoMultisig);
  await zodiac.deployed();
  console.log("✅ ZodiacRoleAssignmentModule deployed at:", zodiac.address);
  deployed.ZodiacRoleAssignmentModule = zodiac.address;

  fs.writeFileSync("deployedGovernanceModules.json", JSON.stringify(deployed, null, 2));
  console.log("📦 Deployment complete.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});