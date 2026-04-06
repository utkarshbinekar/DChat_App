require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.13",
  networks: {
    hardhat: {
      chainId: 1337,
      blockGasLimit: 1_000_000_000,
      allowUnlimitedContractSize: true,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
      blockGasLimit: 1_000_000_000,
      allowUnlimitedContractSize: true,
    },
  },
};
