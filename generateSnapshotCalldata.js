const { ethers } = require("ethers");

// Replace these values
const MODULE_ADDRESS = "0xYourZodiacModule";
const TARGET_CONTRACT = "0xYourAccessControlContract";
const ROLE = ethers.utils.id("CLAIM_VERIFIER_ROLE"); // keccak256
const ACCOUNT_TO_ASSIGN = "0xAgentAddress";

const iface = new ethers.utils.Interface([
  "function assignRole(address target, bytes32 role, address account)"
]);

const data = iface.encodeFunctionData("assignRole", [
  TARGET_CONTRACT,
  ROLE,
  ACCOUNT_TO_ASSIGN
]);

console.log("Snapshot proposal calldata:");
console.log("To:", MODULE_ADDRESS);
console.log("Data:", data);