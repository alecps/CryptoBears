const utils = require('./Utils')
const BigNumber = require('bignumber.js')
const assertDiff = require('assert-diff')
assertDiff.options.strict = true

const CryptoBears = utils.CryptoBears
const BearBucks = utils.BearBucks
const BearCrowdsale = utils.BearCrowdsale
const checkState = utils.checkState
const updateBalances = utils.updateBalances
const getExpectedBalanceDelta = utils.getExpectedBalanceDelta

const startBalance = 100
const feedingCost = 20
const feedingInterval = 3000 // 1000ms == 1sec
const genes = 0
const name = 'Bruno'
const cryptoBearsPrice = Number(web3.toWei(.5, 'ether'))
const bearBucksPrice = Number(web3.toWei(.002, 'ether'))


contract('CrowdsalePositiveTests', async function (accounts) {

  beforeEach('Make fresh contract', async function () {
    cryptoBears = await CryptoBears.new(
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
    let cryptoBearsStateChanges = [
      {'var': 'minter', 'expect': crowdsale.address}
    ]
    let bearBucksStateChanges = [
      {'var': 'minter', 'expect': crowdsale.address}
    ]
    let crowdsaleStateChanges = [

    ]
    await checkState([cryptoBears, bearBucks, crowdsale], [cryptoBearsStateChanges, bearBucksStateChanges, crowdsaleStateChanges], accounts)
  })

  it('should buyBearBucks', async function () {
    let wei_sent = feedingCost * bearBucksPrice

    let res = await crowdsale.buyBearBucks(
      accounts[0], {from: accounts[0], value: wei_sent}
    )
    let gas_used = new BigNumber(res.receipt.gasUsed)

    let delta_account = getExpectedBalanceDelta(gas_used, wei_sent)
    let delta_wallet = wei_sent

    let account_balance = old_account_balance.minus(delta_account).toNumber()
    let wallet_balance = old_wallet_balance.plus(new BigNumber(delta_wallet)).toNumber()

    let cryptoBearsStateChanges = [
      {'var': 'minter', 'expect': crowdsale.address}
    ]
    let bearBucksStateChanges = [
      {'var': 'minter', 'expect': crowdsale.address},
      {'var': 'totalSupply', 'expect': feedingCost},
      {'var': 'balanceOf.a0', 'expect': feedingCost}
    ]
    let crowdsaleStateChanges = [
      {'var': 'weiRaised', 'expect': wei_sent},
      {'var': 'wei_balance.a0', 'expect': account_balance},
      {'var': 'wei_balance.a6', 'expect': wallet_balance},
    ]
    await checkState([cryptoBears, bearBucks, crowdsale], [cryptoBearsStateChanges, bearBucksStateChanges, crowdsaleStateChanges], accounts)
  })

  it('should buyCryptoBear', async function () {
    let wei_sent = cryptoBearsPrice

    let res = await crowdsale.buyCryptoBear(
      genes,
      accounts[0],
      name,
      {from: accounts[0], value: wei_sent}
    )
    let gas_used = new BigNumber(res.receipt.gasUsed)

    let delta_account = getExpectedBalanceDelta(gas_used, wei_sent)
    let delta_wallet = wei_sent

    let account_balance = old_account_balance.minus(delta_account).toNumber()
    let wallet_balance = old_wallet_balance.plus(new BigNumber(delta_wallet)).toNumber()

    let cryptoBearsStateChanges = [
      {'var': 'minter', 'expect': crowdsale.address},
      {'var': 'balanceOf.a0', 'expect': 1},
      {'var': 'ownerOf.b0', 'expect': accounts[0]}
    ]
    let bearBucksStateChanges = [
      {'var': 'minter', 'expect': crowdsale.address},
      {'var': 'totalSupply', 'expect': startBalance},
      {'var': 'balanceOf.a0', 'expect': startBalance}
    ]
    let crowdsaleStateChanges = [
      {'var': 'weiRaised', 'expect': wei_sent},
      {'var': 'wei_balance.a0', 'expect': account_balance},
      {'var': 'wei_balance.a6', 'expect': wallet_balance},
    ]
    await checkState([cryptoBears, bearBucks, crowdsale], [cryptoBearsStateChanges, bearBucksStateChanges, crowdsaleStateChanges], accounts)
  })

  it('should return unspent wei for buyBearBucks', async function () {
    let wei_used = feedingCost * bearBucksPrice
    let wei_returned = bearBucksPrice/2
    let wei_sent = wei_used + wei_returned

    let res = await crowdsale.buyBearBucks(
      accounts[0], {from: accounts[0], value: wei_sent}
    )
    let gas_used = new BigNumber(res.receipt.gasUsed)

    let delta_account = getExpectedBalanceDelta(gas_used, wei_used)
    let delta_wallet = wei_used

    let account_balance = old_account_balance.minus(delta_account).toNumber()
    let wallet_balance = old_wallet_balance.plus(new BigNumber(delta_wallet)).toNumber()

    let cryptoBearsStateChanges = [
      {'var': 'minter', 'expect': crowdsale.address}
    ]
    let bearBucksStateChanges = [
      {'var': 'minter', 'expect': crowdsale.address},
      {'var': 'totalSupply', 'expect': feedingCost},
      {'var': 'balanceOf.a0', 'expect': feedingCost}
    ]
    let crowdsaleStateChanges = [
      {'var': 'weiRaised', 'expect': wei_used},
      {'var': 'wei_balance.a0', 'expect': account_balance},
      {'var': 'wei_balance.a6', 'expect': wallet_balance},
    ]
    await checkState([cryptoBears, bearBucks, crowdsale], [cryptoBearsStateChanges, bearBucksStateChanges, crowdsaleStateChanges], accounts)

  })

  it('should return unspent wei for buyCryptoBear', async function () {
    let wei_used = cryptoBearsPrice
    let wei_returned = cryptoBearsPrice/2
    let wei_sent = wei_used + wei_returned

    let res = await crowdsale.buyCryptoBear(
      genes,
      accounts[0],
      name,
      {from: accounts[0], value: wei_sent}
    )
    let gas_used = new BigNumber(res.receipt.gasUsed)

    let delta_account = getExpectedBalanceDelta(gas_used, wei_used)
    let delta_wallet = wei_used

    let account_balance = old_account_balance.minus(delta_account).toNumber()
    let wallet_balance = old_wallet_balance.plus(new BigNumber(delta_wallet)).toNumber()

    let cryptoBearsStateChanges = [
      {'var': 'minter', 'expect': crowdsale.address},
      {'var': 'balanceOf.a0', 'expect': 1},
      {'var': 'ownerOf.b0', 'expect': accounts[0]}
    ]
    let bearBucksStateChanges = [
      {'var': 'minter', 'expect': crowdsale.address},
      {'var': 'totalSupply', 'expect': startBalance},
      {'var': 'balanceOf.a0', 'expect': startBalance}
    ]
    let crowdsaleStateChanges = [
      {'var': 'weiRaised', 'expect': wei_used},
      {'var': 'wei_balance.a0', 'expect': account_balance},
      {'var': 'wei_balance.a6', 'expect': wallet_balance},
    ]
    await checkState([cryptoBears, bearBucks, crowdsale], [cryptoBearsStateChanges, bearBucksStateChanges, crowdsaleStateChanges], accounts)
  })

})
