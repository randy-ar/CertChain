require("dotenv").config();
require("@nomicfoundation/hardhat-ethers");

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const ALCHEMY_URL = process.env.ALCHEMY_URL || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.27",
    networks: {
        "arbitrum-sepolia": {
            url: ALCHEMY_URL || "https://sepolia-rollup.arbitrum.io/rpc",
            accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
            chainId: 421614,
        },
    },
};
