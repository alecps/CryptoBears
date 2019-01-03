const utils = require('./Utils')
const BigNumber = require('bignumber.js')

const CryptoBears = utils.CryptoBears
const BearBucks = utils.BearBucks
const checkState = utils.checkState
const zero = utils.zero
const pause = utils.pause

const startBalance = 100
const feedingCost = 20
const feedingInterval = 3000 // 1000ms == 1sec
const genes = 0
const name = 'Bruno'


contract('CryptoBearsPositiveTests', async function (accounts) {

  beforeEach('Make fresh contract', async function () {
    cryptoBears = await CryptoBears.new( // We let accounts[5] represent the manager
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

  it('should return balanceOf without changing state', async function () {
    assert.equal(await cryptoBears.balanceOf(accounts[0]), 0)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})
    assert.equal(await cryptoBears.balanceOf(accounts[0]), 1)

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

  it('should return ownerOf without changing state', async function () {
    assert.equal(await cryptoBears.ownerOf(0), zero)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})
    assert.equal(await cryptoBears.ownerOf(0), accounts[0])

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

  it('should return approved without changing state', async function () {
    assert.equal(await cryptoBears.getApproved(0), zero)
    var bearID = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bearID, 0)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})
    await cryptoBears.approve(accounts[1], bearID)
    assert.equal(await cryptoBears.getApproved(0), accounts[1])

    var cryptoBearsStateChanges = [
      {'var': 'balanceOf.a0', 'expect': 1},
      {'var': 'ownerOf.b0', 'expect': accounts[0]},
      {'var': 'getApproved.b0', 'expect': accounts[1]}
    ]
    var bearBucksStateChanges = [
      {'var': 'totalSupply', 'expect': startBalance},
      {'var': 'balanceOf.a0', 'expect': startBalance}
    ]
    await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  })

  it('should setApprovalForAll', async function () {
    await cryptoBears.setApprovalForAll(accounts[1], true, {from: accounts[0]})

    var stateChanges = [
      {'var': 'isApprovedForAll.a0.a1', 'expect': true},
    ]
    await checkState([cryptoBears, bearBucks], [stateChanges, []], accounts)

    await cryptoBears.setApprovalForAll(accounts[1], false, {from: accounts[0]})
    await checkState([cryptoBears, bearBucks], [[], []], accounts)
  })

  it('should approve when msg.sender is owner', async function () {
    var bearID = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bearID, 0)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})
    await cryptoBears.approve(accounts[1], bearID, {from: accounts[0]})

    var cryptoBearsStateChanges = [
      {'var': 'balanceOf.a0', 'expect': 1},
      {'var': 'ownerOf.b0', 'expect': accounts[0]},
      {'var': 'getApproved.b0', 'expect': accounts[1]}
    ]
    var bearBucksStateChanges = [
      {'var': 'totalSupply', 'expect': startBalance},
      {'var': 'balanceOf.a0', 'expect': startBalance}
    ]
    await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  })

  it('should approve when msg.sender isApprovedForAll', async function () {
    var bearID = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bearID, 0)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})
    await cryptoBears.setApprovalForAll(accounts[2], true, {from: accounts[0]})
    await cryptoBears.approve(accounts[1], bearID, {from: accounts[2]})

    var cryptoBearsStateChanges = [
      {'var': 'balanceOf.a0', 'expect': 1},
      {'var': 'ownerOf.b0', 'expect': accounts[0]},
      {'var': 'isApprovedForAll.a0.a2', 'expect': true},
      {'var': 'getApproved.b0', 'expect': accounts[1]}
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

  //NOTE: bearBucks don't transfer along with bears. Change this in part 2?
  it('should transferFrom when msg.sender is owner', async function () {
    var bearID = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bearID, 0)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})
    await cryptoBears.transferFrom(accounts[0], accounts[2], bearID, {from: accounts[0]})

    var cryptoBearsStateChanges = [
      {'var': 'balanceOf.a2', 'expect': 1},
      {'var': 'ownerOf.b0', 'expect': accounts[2]}
    ]
    var bearBucksStateChanges = [
      {'var': 'totalSupply', 'expect': startBalance},
      {'var': 'balanceOf.a0', 'expect': startBalance}
    ]
    await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  })

  it('should transferFrom when msg.sender is approved', async function () {
    var bearID = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bearID, 0)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})
    await cryptoBears.approve(accounts[1], bearID, {from: accounts[0]})
    await cryptoBears.transferFrom(accounts[0], accounts[2], bearID, {from: accounts[1]})

    var cryptoBearsStateChanges = [
      {'var': 'balanceOf.a2', 'expect': 1},
      {'var': 'ownerOf.b0', 'expect': accounts[2]}
    ]
    var bearBucksStateChanges = [
      {'var': 'totalSupply', 'expect': startBalance},
      {'var': 'balanceOf.a0', 'expect': startBalance}
    ]
    await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  })

  it('should transferFrom when msg.sender isApprovedForAll', async function () {
    var bearID = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bearID, 0)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})
    await cryptoBears.setApprovalForAll(accounts[1], true, {from: accounts[0]})
    await cryptoBears.transferFrom(accounts[0], accounts[2], bearID, {from: accounts[1]})

    var cryptoBearsStateChanges = [
      {'var': 'balanceOf.a2', 'expect': 1},
      {'var': 'ownerOf.b0', 'expect': accounts[2]},
      {'var': 'isApprovedForAll.a0.a1', 'expect': true},
    ]
    var bearBucksStateChanges = [
      {'var': 'totalSupply', 'expect': startBalance},
      {'var': 'balanceOf.a0', 'expect': startBalance}
    ]
    await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  })

  it('should feed bear, updating timeLastFed', async function () {
    var bearID = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bearID, 0)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})

    // Wait for one feedingInterval, then feed.
    await pause(feedingInterval)
    await cryptoBears.feed(bearID, feedingCost, {from: accounts[0]})

    var newTimeLastFed =
      (await cryptoBears.getTimeOfBirth.call(bearID)).toNumber() +
      (feedingInterval/1000)

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
    await cryptoBears.placeBet(bear1, bear2, feedingCost, {from: accounts[0]})
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
      {'var': 'betSum.a0', 'expect': feedingCost}
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
    await cryptoBears.removeBet(bear1, bear2, {from: accounts[0]})
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
    ]
    await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  })

  it('should payWinner', async function () {
    //TODO
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

    await cryptoBears.payWinner(bear1, bear2, {from: accounts[5]})

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
    ]
    await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  })

})
