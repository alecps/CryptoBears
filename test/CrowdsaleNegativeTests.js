const utils = require('./Utils')
const BigNumber = require('bignumber.js')
const assertDiff = require('assert-diff')
assertDiff.options.strict = true

const CryptoBears = utils.CryptoBears
const BearBucks = utils.BearBucks
const BearCrowdsale = utils.BearCrowdsale
const checkState = utils.checkState
const expectRevert = utils.expectRevert
const updateBalances = utils.updateBalances
const getGasUsed = utils.getGasUsed
const zero = utils.zero
const getExpectedBalanceDelta = utils.getExpectedBalanceDelta

const startBalance = 100
const feedingCost = 20
const feedingInterval = 3000 // 1000ms == 1sec
const genes = 0
const name = 'Bruno'
const cryptoBearsPrice = Number(web3.toWei(.5, 'ether'))
const bearBucksPrice = Number(web3.toWei(.002, 'ether'))


contract('CrowdsaleNegativeTests', async function (accounts) {

  beforeEach('Make fresh contract', async function () {
    cryptoBears = await CryptoBears.new( // We let accounts[5] represent the referee.
      startBalance, feedingCost, feedingInterval/1000, accounts[5])
    bearBucks = BearBucks.at(await cryptoBears._BearBucksContract.call())
    crowdsale = await BearCrowdsale.new(
      accounts[6], // We let accounts[6] represent the wallet.
      cryptoBears.address,
      bearBucksPrice,
      cryptoBearsPrice
    )
    await cryptoBears.setMinter(crowdsale.address, {from: accounts[5]})
    old_account_balance = await web3.eth.getBalance(accounts[0])
    old_wallet_balance = await web3.eth.getBalance(accounts[6])
    await updateBalances(accounts)
  })

  it('should have correct initial state', async function () {
    var cryptoBearsStateChanges = [
      {'var': 'minter', 'expect': crowdsale.address}
    ]
    var bearBucksStateChanges = [
      {'var': 'minter', 'expect': crowdsale.address}
    ]
    var crowdsaleStateChanges = [

    ]
    await checkState([cryptoBears, bearBucks, crowdsale], [cryptoBearsStateChanges, bearBucksStateChanges, crowdsaleStateChanges], accounts)
  })

  it('should fail to buyBearBucks with insufficient funds', async function () {
    var wei_sent = bearBucksPrice - 1

    await expectRevert(
      crowdsale.buyBearBucks(accounts[0], {from: accounts[0], value: wei_sent}))

    var gas_used = await getGasUsed()
    var account_balance = old_account_balance.minus(
      new BigNumber(gas_used)).toNumber()

    var cryptoBearsStateChanges = [
      {'var': 'minter', 'expect': crowdsale.address}
    ]
    var bearBucksStateChanges = [
      {'var': 'minter', 'expect': crowdsale.address}
    ]
    var crowdsaleStateChanges = [
      {'var': 'wei_balance.a0', 'expect': account_balance},
    ]
    await checkState([cryptoBears, bearBucks, crowdsale], [cryptoBearsStateChanges, bearBucksStateChanges, crowdsaleStateChanges], accounts)
  })

  it('should fail to buyCryptoBear with insufficient funds', async function () {
    var wei_sent = cryptoBearsPrice * .9

    await expectRevert(crowdsale.buyCryptoBear(
      genes,
      accounts[0],
      name,
      {from: accounts[0], value: wei_sent}
    ))

    var gas_used = await getGasUsed()
    var account_balance = old_account_balance.minus(
      new BigNumber(gas_used)).toNumber()

    var cryptoBearsStateChanges = [
      {'var': 'minter', 'expect': crowdsale.address}
    ]
    var bearBucksStateChanges = [
      {'var': 'minter', 'expect': crowdsale.address}
    ]
    var crowdsaleStateChanges = [
      {'var': 'wei_balance.a0', 'expect': account_balance},
    ]
    await checkState([cryptoBears, bearBucks, crowdsale], [cryptoBearsStateChanges, bearBucksStateChanges, crowdsaleStateChanges], accounts)
  })

  it('should fail to buyBearBucks when beneficiary is address(0)', async function () {
    var wei_sent = bearBucksPrice

    await expectRevert(
      crowdsale.buyBearBucks(zero, {from: accounts[0], value: wei_sent}))

    var gas_used = await getGasUsed()
    var account_balance = old_account_balance.minus(
      new BigNumber(gas_used)).toNumber()

    var cryptoBearsStateChanges = [
      {'var': 'minter', 'expect': crowdsale.address}
    ]
    var bearBucksStateChanges = [
      {'var': 'minter', 'expect': crowdsale.address}
    ]
    var crowdsaleStateChanges = [
      {'var': 'wei_balance.a0', 'expect': account_balance},
    ]
    await checkState([cryptoBears, bearBucks, crowdsale], [cryptoBearsStateChanges, bearBucksStateChanges, crowdsaleStateChanges], accounts)
  })

  it('should fail to buyCryptoBear when beneficiary is address(0)', async function () {
    var wei_sent = cryptoBearsPrice

    await expectRevert(crowdsale.buyCryptoBear(
      genes,
      zero,
      name,
      {from: accounts[0], value: wei_sent}
    ))

    var gas_used = await getGasUsed()
    var account_balance = old_account_balance.minus(
      new BigNumber(gas_used)).toNumber()

    var cryptoBearsStateChanges = [
      {'var': 'minter', 'expect': crowdsale.address}
    ]
    var bearBucksStateChanges = [
      {'var': 'minter', 'expect': crowdsale.address}
    ]
    var crowdsaleStateChanges = [
      {'var': 'wei_balance.a0', 'expect': account_balance},
    ]
    await checkState([cryptoBears, bearBucks, crowdsale], [cryptoBearsStateChanges, bearBucksStateChanges, crowdsaleStateChanges], accounts)
  })

})
