const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const [caller] = await hre.ethers.getSigners();

  const vestingData = JSON.parse(fs.readFileSync("deployedLinearVesting.json"));
  const releasedLog = [];

  for (const [label, address] of Object.entries(vestingData)) {
    const vesting = await hre.ethers.getContractAt("LinearVesting", address);

    try {
      const releasable = await vesting.releasableAmount();
      if (releasable.gt(0)) {
        const tx = await vesting.release();
        await tx.wait();
        console.log(`✅ Released ${hre.ethers.utils.formatEther(releasable)} tokens from ${label}`);
        releasedLog.push({ contract: address, amount: releasable.toString() });
      } else {
        console.log(`⏳ No tokens to release yet for ${label}`);
      }
    } catch (err) {
      console.error(`❌ Error releasing for ${label}:`, err.message);
    }
  }

  fs.writeFileSync("releasedVestingTokens.json", JSON.stringify(releasedLog, null, 2));
  console.log("📦 All eligible vesting releases complete.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});