const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying WUNToken with:", deployer.address);

  const WUNToken = await hre.ethers.getContractFactory("WUNToken");
  const wun = await WUNToken.deploy();
  await wun.deployed();

  console.log("✅ WUNToken deployed at:", wun.address);

  fs.writeFileSync(
    "deployedAddresses.json",
    JSON.stringify({ WUNToken: wun.address }, null, 2)
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
