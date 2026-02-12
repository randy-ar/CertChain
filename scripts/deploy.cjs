const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying with account:", deployer.address);

    const SimpleCert = await hre.ethers.getContractFactory("SimpleCert");
    const contract = await SimpleCert.deploy();
    await contract.waitForDeployment();

    const address = await contract.getAddress();

    console.log("");
    console.log("========================================");
    console.log("  SimpleCert deployed successfully!");
    console.log("========================================");
    console.log("  Address:", address);
    console.log("");
    console.log("  Update CONTRACT_ADDRESS in src/lib/blockchain.ts:");
    console.log(`  const CONTRACT_ADDRESS = "${address}";`);
    console.log("========================================");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
