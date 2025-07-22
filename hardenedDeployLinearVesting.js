const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  // Replace with actual deployed WUNToken address
  const wunAddress = "0xYourWUNTokenAddressHere";
  if (!wunAddress || wunAddress === ethers.constants.AddressZero) {
    throw new Error("Missing WUNToken address. Please update the script.");
  }

  const WUNToken = await hre.ethers.getContractAt("WUNToken", wunAddress);

  // Replace with real beneficiary vesting config
  const vestingSchedules = [
    {
      beneficiary: "0xFounder1Address",
      start: Math.floor(Date.now() / 1000), // now
      duration: 60 * 60 * 24 * 365, // 1 year
      amount: hre.ethers.utils.parseUnits("11100000", 18) // 10% of 111M
    },
    {
      beneficiary: "0xFounder2Address",
      start: Math.floor(Date.now() / 1000),
      duration: 60 * 60 * 24 * 730, // 2 years
      amount: hre.ethers.utils.parseUnits("5550000", 18) // 5%
    }
  ];

  const deployed = {};
  const roleLog = [];

  for (const schedule of vestingSchedules) {
    const LinearVesting = await hre.ethers.getContractFactory("LinearVesting");
    const vesting = await LinearVesting.deploy(
      wunAddress,
      schedule.beneficiary,
      schedule.start,
      schedule.duration
    );
    await vesting.deployed();

    console.log(`✅ LinearVesting deployed for ${schedule.beneficiary} at:`, vesting.address);
    deployed[`LinearVesting_${schedule.beneficiary}`] = vesting.address;

    // Transfer tokens to vesting contract
    await WUNToken.transfer(vesting.address, schedule.amount);
    console.log(`💰 Seeded ${schedule.amount.toString()} WUN to vesting contract`);
    roleLog.push({
      contract: vesting.address,
      beneficiary: schedule.beneficiary,
      amount: schedule.amount.toString(),
      durationDays: schedule.duration / (60 * 60 * 24)
    });
  }

  fs.writeFileSync("deployedLinearVesting.json", JSON.stringify(deployed, null, 2));
  fs.writeFileSync("vestingAllocations.json", JSON.stringify(roleLog, null, 2));
  console.log("📜 All LinearVesting contracts deployed + funded.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});