module.exports = {
  contracts_directory: "contracts_solutions",
  //contracts_directory: "contracts_stencil",
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*", // Match any network id
      gas: 10000000,
    }
  }
};
