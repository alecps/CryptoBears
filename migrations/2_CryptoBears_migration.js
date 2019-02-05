const CryptoBears = artifacts.require("CryptoBears")
const BearCrowdsale = artifacts.require("BearCrowdsale")
const ReentrancyExploit = artifacts.require('ReentrancyExploit')

const startBalance = 100
const feedingCost = 20
const feedingInterval = 60 //seconds

const cryptoBearsPrice = Number(web3.toWei(.5, 'ether'))
const bearBucksPrice = Number(web3.toWei(.002, 'ether'))

module.exports = function(deployer, network, accounts) {
  deployer.deploy(
    CryptoBears,
    startBalance,
    feedingCost,
    feedingInterval,
    accounts[5]
  ).then(function() {
    return deployer.deploy(
      BearCrowdsale,
      accounts[6],
      CryptoBears.address,
      bearBucksPrice,
      cryptoBearsPrice,
    )
  }).then(function() {
    return deployer.deploy(
      ReentrancyExploit,
      BearCrowdsale.address,
      {from: accounts[7]}
    )
  })
}
