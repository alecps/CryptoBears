const CryptoBears = artifacts.require("CryptoBears")

const startBalance = 100
const feedingCost = 20
const feedingInterval = 60 //seconds

module.exports = function(deployer, network, accounts) {
  deployer.deploy(CryptoBears, startBalance, feedingCost, feedingInterval, accounts[5])
}
