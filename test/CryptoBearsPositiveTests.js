const utils = require('./Utils')
const BigNumber = require('bignumber.js')

const CryptoBears = utils.CryptoBears
const BearBucks = utils.BearBucks
const checkState = utils.checkState
const checkEvent = utils.checkEvent

const zero = utils.zero
const pause = utils.pause

const startBalance = 100
const feedingCost = 20
const feedingInterval = 3000 // 1000ms == 1sec
const genes = 0
const name = 'Bruno'


contract('CryptoBearsPositiveTests', async function (accounts) {

  beforeEach('Make fresh contract', async function () {
    cryptoBears = await CryptoBears.new( // We let accounts[5] represent the referee/minter.
      startBalance, feedingCost, feedingInterval/1000, accounts[5])
    bearBucks = BearBucks.at(await cryptoBears._BearBucksContract.call())
  })

  it('should have correct initial state', async function () {
    await checkState([cryptoBears, bearBucks], [[], []], accounts)
  })

  it('should create newBear, minting startBalance BearBucks to its owner', async function () {
    var bearID = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bearID, 0)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})
    var cryptoBearsStateChanges = [
      {'var': 'balanceOf.a0', 'expect': 1},
      {'var': 'ownerOf.b0', 'expect': accounts[0]},
    ]
    var bearBucksStateChanges = [
      {'var': 'totalSupply', 'expect': startBalance},
      {'var': 'balanceOf.a0', 'expect': startBalance}
    ]
    await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  })

  it('should return isApprovedForAll without changing state', async function () {
    assert(!await cryptoBears.isApprovedForAll(accounts[0], accounts[1]))
    await checkState([cryptoBears, bearBucks], [[], []], accounts)
  })

  it('should feed bear, updating timeLastFed', async function () {
    var bearID = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bearID, 0)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})

    // Wait for one feedingInterval, then feed.
    await pause(feedingInterval)
    let event = await cryptoBears.feed(bearID, feedingCost, {from: accounts[0]})
    var newTimeLastFed =
      (await cryptoBears.getTimeOfBirth.call(bearID)).toNumber() +
      (feedingInterval/1000)
    checkEvent('bearFed', event, [new BigNumber(bearID), new BigNumber(newTimeLastFed)])

    var cryptoBearsStateChanges = [
      {'var': 'balanceOf.a0', 'expect': 1},
      {'var': 'ownerOf.b0', 'expect': accounts[0]},
      {'var': 'timeLastFed.b0', 'expect': newTimeLastFed}
    ]
    var bearBucksStateChanges = [
      {'var': 'totalSupply', 'expect': startBalance - feedingCost},
      {'var': 'balanceOf.a0', 'expect': startBalance - feedingCost}
    ]
    await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  })

  it('should getNumBears without changing state', async function () {
    assert.equal(await cryptoBears.getNumBears(), 0)
    await checkState([cryptoBears, bearBucks], [[], []], accounts)
    var bearID = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bearID, 0)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})
    assert.equal(await cryptoBears.getNumBears(), 1)
    var cryptoBearsStateChanges = [
      {'var': 'balanceOf.a0', 'expect': 1},
      {'var': 'ownerOf.b0', 'expect': accounts[0]},
    ]
    var bearBucksStateChanges = [
      {'var': 'totalSupply', 'expect': startBalance},
      {'var': 'balanceOf.a0', 'expect': startBalance}
    ]
    await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  })

  it('should getMealsNeeded without changing state', async function () {
    var bearID = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bearID, 0)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})
    assert.equal(await cryptoBears.getMealsNeeded(bearID), 0)
    await pause(feedingInterval*2)
    assert.equal(await cryptoBears.getMealsNeeded(bearID), 2)
    var cryptoBearsStateChanges = [
      {'var': 'balanceOf.a0', 'expect': 1},
      {'var': 'ownerOf.b0', 'expect': accounts[0]},
    ]
    var bearBucksStateChanges = [
      {'var': 'totalSupply', 'expect': startBalance},
      {'var': 'balanceOf.a0', 'expect': startBalance}
    ]
    await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  })

  it('should getTimeLastFed and getTimeOfBirth without changing state', async function () {
    var bearID = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bearID, 0)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})
    assert.equal(
      (await cryptoBears.getTimeLastFed(bearID)).toNumber(),
      (await cryptoBears.getTimeOfBirth(bearID)).toNumber()
    )
    var cryptoBearsStateChanges = [
      {'var': 'balanceOf.a0', 'expect': 1},
      {'var': 'ownerOf.b0', 'expect': accounts[0]},
    ]
    var bearBucksStateChanges = [
      {'var': 'totalSupply', 'expect': startBalance},
      {'var': 'balanceOf.a0', 'expect': startBalance}
    ]
    await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  })

  it('should placeBet', async function () {
    var bear1 = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bear1, 0)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})
    var bear2 = (await cryptoBears.newBear.call(genes, accounts[1], name, {from: accounts[5]})).toNumber()
    assert.equal(bear2, 1)
    await cryptoBears.newBear(genes, accounts[1], name, {from: accounts[5]})

    await bearBucks.approve(cryptoBears.address, feedingCost, {from: accounts[0]})
    let event = await cryptoBears.placeBet(bear1, bear2, feedingCost, {from: accounts[0]})
    checkEvent('betPlaced', event, [new BigNumber(bear1), new BigNumber(bear2), new BigNumber(feedingCost)])
    var cryptoBearsStateChanges = [
      {'var': 'balanceOf.a0', 'expect': 1},
      {'var': 'balanceOf.a1', 'expect': 1},
      {'var': 'ownerOf.b0', 'expect': accounts[0]},
      {'var': 'ownerOf.b1', 'expect': accounts[1]},
      {'var': 'bets.b0.b1', 'expect': feedingCost},
    ]
    var bearBucksStateChanges = [
      {'var': 'totalSupply', 'expect': startBalance*2},
      {'var': 'balanceOf.a0', 'expect': startBalance},
      {'var': 'balanceOf.a1', 'expect': startBalance},
      {'var': 'betSum.a0', 'expect': feedingCost},
      {'var': 'allowance.a0.cb', 'expect': feedingCost},
    ]
    await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  })

  it('should placeBet with same bear', async function () {
    var bear1 = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bear1, 0)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})

    await bearBucks.approve(cryptoBears.address, feedingCost, {from: accounts[0]})
    let event = await cryptoBears.placeBet(bear1, bear1, feedingCost, {from: accounts[0]})
    checkEvent('betPlaced', event, [new BigNumber(bear1), new BigNumber(bear1), new BigNumber(feedingCost)])
    var cryptoBearsStateChanges = [
      {'var': 'balanceOf.a0', 'expect': 1},
      {'var': 'ownerOf.b0', 'expect': accounts[0]},
      {'var': 'bets.b0.b0', 'expect': feedingCost},
    ]
    var bearBucksStateChanges = [
      {'var': 'totalSupply', 'expect': startBalance},
      {'var': 'balanceOf.a0', 'expect': startBalance},
      {'var': 'betSum.a0', 'expect': feedingCost},
      {'var': 'allowance.a0.cb', 'expect': feedingCost},
    ]
    await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  })

  it('should placeBet with same owner different bear', async function () {
    var bear1 = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bear1, 0)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})
    var bear2 = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bear2, 1)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})

    await bearBucks.approve(cryptoBears.address, feedingCost, {from: accounts[0]})
    let event = await cryptoBears.placeBet(bear1, bear2, feedingCost, {from: accounts[0]})
    checkEvent('betPlaced', event, [new BigNumber(bear1), new BigNumber(bear2), new BigNumber(feedingCost)])
    var cryptoBearsStateChanges = [
      {'var': 'balanceOf.a0', 'expect': 2},
      {'var': 'ownerOf.b0', 'expect': accounts[0]},
      {'var': 'ownerOf.b1', 'expect': accounts[0]},
      {'var': 'bets.b0.b1', 'expect': feedingCost},
    ]
    var bearBucksStateChanges = [
      {'var': 'totalSupply', 'expect': startBalance*2},
      {'var': 'balanceOf.a0', 'expect': startBalance*2},
      {'var': 'betSum.a0', 'expect': feedingCost},
      {'var': 'allowance.a0.cb', 'expect': feedingCost},
    ]
    await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  })

  it('should removeBet', async function () {
    var bear1 = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bear1, 0)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})
    var bear2 = (await cryptoBears.newBear.call(genes, accounts[1], name, {from: accounts[5]})).toNumber()
    assert.equal(bear2, 1)
    await cryptoBears.newBear(genes, accounts[1], name, {from: accounts[5]})

    await bearBucks.approve(cryptoBears.address, feedingCost, {from: accounts[0]})
    await cryptoBears.placeBet(bear1, bear2, feedingCost, {from: accounts[0]})
    let event = await cryptoBears.removeBet(bear1, bear2, {from: accounts[0]})
    checkEvent('betRemoved', event, [new BigNumber(bear1), new BigNumber(bear2)])
    var cryptoBearsStateChanges = [
      {'var': 'balanceOf.a0', 'expect': 1},
      {'var': 'balanceOf.a1', 'expect': 1},
      {'var': 'ownerOf.b0', 'expect': accounts[0]},
      {'var': 'ownerOf.b1', 'expect': accounts[1]},
    ]
    var bearBucksStateChanges = [
      {'var': 'totalSupply', 'expect': startBalance*2},
      {'var': 'balanceOf.a0', 'expect': startBalance},
      {'var': 'balanceOf.a1', 'expect': startBalance},
      {'var': 'allowance.a0.cb', 'expect': feedingCost},
    ]
    await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  })

  it('should removeBet with same bear', async function () {
    var bear1 = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bear1, 0)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})

    await bearBucks.approve(cryptoBears.address, feedingCost, {from: accounts[0]})
    await cryptoBears.placeBet(bear1, bear1, feedingCost, {from: accounts[0]})
    let event = await cryptoBears.removeBet(bear1, bear1, {from: accounts[0]})
    checkEvent('betRemoved', event, [new BigNumber(bear1), new BigNumber(bear1)])
    var cryptoBearsStateChanges = [
      {'var': 'balanceOf.a0', 'expect': 1},
      {'var': 'ownerOf.b0', 'expect': accounts[0]},
    ]
    var bearBucksStateChanges = [
      {'var': 'totalSupply', 'expect': startBalance},
      {'var': 'balanceOf.a0', 'expect': startBalance},
      {'var': 'allowance.a0.cb', 'expect': feedingCost},
    ]
    await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  })

  it('should removeBet with same owner different bear', async function () {
    var bear1 = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bear1, 0)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})
    var bear2 = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bear2, 1)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})

    await bearBucks.approve(cryptoBears.address, feedingCost, {from: accounts[0]})
    await cryptoBears.placeBet(bear1, bear2, feedingCost, {from: accounts[0]})
    let event = await cryptoBears.removeBet(bear1, bear2, {from: accounts[0]})
    checkEvent('betRemoved', event, [new BigNumber(bear1), new BigNumber(bear2)])
    var cryptoBearsStateChanges = [
      {'var': 'balanceOf.a0', 'expect': 2},
      {'var': 'ownerOf.b0', 'expect': accounts[0]},
      {'var': 'ownerOf.b1', 'expect': accounts[0]},
    ]
    var bearBucksStateChanges = [
      {'var': 'totalSupply', 'expect': startBalance*2},
      {'var': 'balanceOf.a0', 'expect': startBalance*2},
      {'var': 'allowance.a0.cb', 'expect': feedingCost},
    ]
    await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  })

  it('should payWinner', async function () {
    var bear1 = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bear1, 0)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})
    var bear2 = (await cryptoBears.newBear.call(genes, accounts[1], name, {from: accounts[5]})).toNumber()
    assert.equal(bear2, 1)
    await cryptoBears.newBear(genes, accounts[1], name, {from: accounts[5]})

    await bearBucks.approve(cryptoBears.address, feedingCost, {from: accounts[0]})
    await cryptoBears.placeBet(bear1, bear2, feedingCost, {from: accounts[0]})
    await bearBucks.approve(cryptoBears.address, feedingCost, {from: accounts[1]})
    await cryptoBears.placeBet(bear2, bear1, feedingCost, {from: accounts[1]})

    let event = await cryptoBears.payWinner(bear1, bear2, {from: accounts[5]})
    checkEvent('betSettled', event, [new BigNumber(bear1), new BigNumber(bear2)])

    var cryptoBearsStateChanges = [
      {'var': 'balanceOf.a0', 'expect': 1},
      {'var': 'balanceOf.a1', 'expect': 1},
      {'var': 'ownerOf.b0', 'expect': accounts[0]},
      {'var': 'ownerOf.b1', 'expect': accounts[1]},
    ]
    var bearBucksStateChanges = [
      {'var': 'totalSupply', 'expect': startBalance*2},
      {'var': 'balanceOf.a0', 'expect': startBalance+feedingCost},
      {'var': 'balanceOf.a1', 'expect': startBalance-feedingCost},
      {'var': 'allowance.a0.cb', 'expect': feedingCost},
    ]
    await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  })

  it('should payWinner for same-bear-bet without changing balance', async function () {
    var bear1 = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bear1, 0)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})

    await bearBucks.approve(cryptoBears.address, feedingCost, {from: accounts[0]})
    await cryptoBears.placeBet(bear1, bear1, feedingCost, {from: accounts[0]})

    let event = await cryptoBears.payWinner(bear1, bear1, {from: accounts[5]})
    checkEvent('betSettled', event, [new BigNumber(bear1), new BigNumber(bear1)])

    var cryptoBearsStateChanges = [
      {'var': 'balanceOf.a0', 'expect': 1},
      {'var': 'ownerOf.b0', 'expect': accounts[0]},
    ]
    var bearBucksStateChanges = [
      {'var': 'totalSupply', 'expect': startBalance},
      {'var': 'balanceOf.a0', 'expect': startBalance},
    ]
    await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  })

  it('should payWinner for same-owner-different-bear-bet without changing balance', async function () {
    var bear1 = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bear1, 0)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})
    var bear2 = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bear2, 1)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})

    await bearBucks.approve(cryptoBears.address, feedingCost*2, {from: accounts[0]})
    await cryptoBears.placeBet(bear1, bear2, feedingCost, {from: accounts[0]})
    await cryptoBears.placeBet(bear2, bear1, feedingCost, {from: accounts[0]})

    let event = await cryptoBears.payWinner(bear1, bear2, {from: accounts[5]})
    checkEvent('betSettled', event, [new BigNumber(bear1), new BigNumber(bear2)])

    var cryptoBearsStateChanges = [
      {'var': 'balanceOf.a0', 'expect': 2},
      {'var': 'ownerOf.b0', 'expect': accounts[0]},
      {'var': 'ownerOf.b1', 'expect': accounts[0]},
    ]
    var bearBucksStateChanges = [
      {'var': 'totalSupply', 'expect': startBalance*2},
      {'var': 'balanceOf.a0', 'expect': startBalance*2},
      {'var': 'allowance.a0.cb', 'expect': feedingCost},
    ]
    await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  })

})
