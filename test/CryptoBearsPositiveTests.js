const utils = require('./Utils')
const BigNumber = require('bignumber.js')

const CryptoBears = utils.CryptoBears
const BearBucks = utils.BearBucks
const checkState = utils.checkState
const checkEvent = utils.checkEvent
const generateSecret = utils.generateSecret
const generateHash = utils.generateHash
const calculateWinner= utils.calculateWinner

const zero40 = utils.zero40
const zero64 = utils.zero64
const pause = utils.pause

const startBalance = 100
const feedingCost = 20
const feedingInterval = 3000 // 1000ms == 1sec
const genes = 0
const name = 'Bruno'


contract('CryptoBearsPositiveTests', async function (accounts) {

  beforeEach('Make fresh contract', async function () {
    cryptoBears = await CryptoBears.new( // We let accounts[5] represent the minter.
      startBalance, feedingCost, feedingInterval/1000, accounts[5])
    bearBucks = BearBucks.at(await cryptoBears._BearBucksContract.call())
  })

  it('should have correct initial state', async function () {
    await checkState([cryptoBears, bearBucks], [[], []], accounts)
  })

  it('should create newBear, minting startBalance BearBucks to its owner', async function () {
    let bearID = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bearID, 0)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})
    let cryptoBearsStateChanges = [
      {'var': 'balanceOf.a0', 'expect': 1},
      {'var': 'ownerOf.b0', 'expect': accounts[0]},
    ]
    let bearBucksStateChanges = [
      {'var': 'totalSupply', 'expect': startBalance},
      {'var': 'balanceOf.a0', 'expect': startBalance}
    ]
    await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  })

  it('should feed bear, updating timeLastFed', async function () {
    let bearID = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bearID, 0)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})

    // Wait for one feedingInterval, then feed.
    await pause(feedingInterval)
    let event = await cryptoBears.feed(bearID, feedingCost, {from: accounts[0]})
    let newTimeLastFed =
      (await cryptoBears.getTimeOfBirth.call(bearID)).toNumber() +
      (feedingInterval/1000)
    checkEvent('bearFed', event, [new BigNumber(bearID), new BigNumber(newTimeLastFed)])

    let cryptoBearsStateChanges = [
      {'var': 'balanceOf.a0', 'expect': 1},
      {'var': 'ownerOf.b0', 'expect': accounts[0]},
      {'var': 'timeLastFed.b0', 'expect': newTimeLastFed}
    ]
    let bearBucksStateChanges = [
      {'var': 'totalSupply', 'expect': startBalance - feedingCost},
      {'var': 'balanceOf.a0', 'expect': startBalance - feedingCost}
    ]
    await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  })

  it('should getNumBears without changing state', async function () {
    assert.equal(await cryptoBears.getNumBears(), 0)
    await checkState([cryptoBears, bearBucks], [[], []], accounts)
    let bearID = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bearID, 0)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})
    assert.equal(await cryptoBears.getNumBears(), 1)
    let cryptoBearsStateChanges = [
      {'var': 'balanceOf.a0', 'expect': 1},
      {'var': 'ownerOf.b0', 'expect': accounts[0]},
    ]
    let bearBucksStateChanges = [
      {'var': 'totalSupply', 'expect': startBalance},
      {'var': 'balanceOf.a0', 'expect': startBalance}
    ]
    await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  })

  it('should getMealsNeeded without changing state', async function () {
    let bearID = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bearID, 0)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})
    assert.equal(await cryptoBears.getMealsNeeded(bearID), 0)
    await pause(feedingInterval*2)
    assert.equal(await cryptoBears.getMealsNeeded(bearID), 2)
    let cryptoBearsStateChanges = [
      {'var': 'balanceOf.a0', 'expect': 1},
      {'var': 'ownerOf.b0', 'expect': accounts[0]},
    ]
    let bearBucksStateChanges = [
      {'var': 'totalSupply', 'expect': startBalance},
      {'var': 'balanceOf.a0', 'expect': startBalance}
    ]
    await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  })

  it('should getTimeLastFed and getTimeOfBirth without changing state', async function () {
    let bearID = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bearID, 0)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})
    assert.equal(
      (await cryptoBears.getTimeLastFed(bearID)).toNumber(),
      (await cryptoBears.getTimeOfBirth(bearID)).toNumber()
    )
    let cryptoBearsStateChanges = [
      {'var': 'balanceOf.a0', 'expect': 1},
      {'var': 'ownerOf.b0', 'expect': accounts[0]},
    ]
    let bearBucksStateChanges = [
      {'var': 'totalSupply', 'expect': startBalance},
      {'var': 'balanceOf.a0', 'expect': startBalance}
    ]
    await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  })

  it('should placeBet', async function () {
    let bear1 = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bear1, 0)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})
    let bear2 = (await cryptoBears.newBear.call(genes, accounts[1], name, {from: accounts[5]})).toNumber()
    assert.equal(bear2, 1)
    await cryptoBears.newBear(genes, accounts[1], name, {from: accounts[5]})

    await bearBucks.approve(cryptoBears.address, feedingCost, {from: accounts[0]})
    let event = await cryptoBears.placeBet(bear1, bear2, feedingCost, {from: accounts[0]})
    checkEvent('betPlaced', event, [new BigNumber(bear1), new BigNumber(bear2), new BigNumber(feedingCost)])
    let cryptoBearsStateChanges = [
      {'var': 'balanceOf.a0', 'expect': 1},
      {'var': 'balanceOf.a1', 'expect': 1},
      {'var': 'ownerOf.b0', 'expect': accounts[0]},
      {'var': 'ownerOf.b1', 'expect': accounts[1]},
      {'var': 'bets.b0.b1', 'expect': feedingCost},
    ]
    let bearBucksStateChanges = [
      {'var': 'totalSupply', 'expect': startBalance*2},
      {'var': 'balanceOf.a0', 'expect': startBalance},
      {'var': 'balanceOf.a1', 'expect': startBalance},
      {'var': 'betSum.a0', 'expect': feedingCost},
      {'var': 'allowance.a0.cb', 'expect': feedingCost},
    ]
    await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  })

  it('should placeBet with same bear', async function () {
    let bear1 = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bear1, 0)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})

    await bearBucks.approve(cryptoBears.address, feedingCost, {from: accounts[0]})
    let event = await cryptoBears.placeBet(bear1, bear1, feedingCost, {from: accounts[0]})
    checkEvent('betPlaced', event, [new BigNumber(bear1), new BigNumber(bear1), new BigNumber(feedingCost)])
    let cryptoBearsStateChanges = [
      {'var': 'balanceOf.a0', 'expect': 1},
      {'var': 'ownerOf.b0', 'expect': accounts[0]},
      {'var': 'bets.b0.b0', 'expect': feedingCost},
    ]
    let bearBucksStateChanges = [
      {'var': 'totalSupply', 'expect': startBalance},
      {'var': 'balanceOf.a0', 'expect': startBalance},
      {'var': 'betSum.a0', 'expect': feedingCost},
      {'var': 'allowance.a0.cb', 'expect': feedingCost},
    ]
    await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  })

  it('should placeBet with same owner different bear', async function () {
    let bear1 = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bear1, 0)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})
    let bear2 = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bear2, 1)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})

    await bearBucks.approve(cryptoBears.address, feedingCost, {from: accounts[0]})
    let event = await cryptoBears.placeBet(bear1, bear2, feedingCost, {from: accounts[0]})
    checkEvent('betPlaced', event, [new BigNumber(bear1), new BigNumber(bear2), new BigNumber(feedingCost)])
    let cryptoBearsStateChanges = [
      {'var': 'balanceOf.a0', 'expect': 2},
      {'var': 'ownerOf.b0', 'expect': accounts[0]},
      {'var': 'ownerOf.b1', 'expect': accounts[0]},
      {'var': 'bets.b0.b1', 'expect': feedingCost},
    ]
    let bearBucksStateChanges = [
      {'var': 'totalSupply', 'expect': startBalance*2},
      {'var': 'balanceOf.a0', 'expect': startBalance*2},
      {'var': 'betSum.a0', 'expect': feedingCost},
      {'var': 'allowance.a0.cb', 'expect': feedingCost},
    ]
    await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  })

  it('should removeBet', async function () {
    let bear1 = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bear1, 0)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})
    let bear2 = (await cryptoBears.newBear.call(genes, accounts[1], name, {from: accounts[5]})).toNumber()
    assert.equal(bear2, 1)
    await cryptoBears.newBear(genes, accounts[1], name, {from: accounts[5]})

    await bearBucks.approve(cryptoBears.address, feedingCost, {from: accounts[0]})
    await cryptoBears.placeBet(bear1, bear2, feedingCost, {from: accounts[0]})
    let event = await cryptoBears.removeBet(bear1, bear2, {from: accounts[0]})
    checkEvent('betRemoved', event, [new BigNumber(bear1), new BigNumber(bear2)])
    let cryptoBearsStateChanges = [
      {'var': 'balanceOf.a0', 'expect': 1},
      {'var': 'balanceOf.a1', 'expect': 1},
      {'var': 'ownerOf.b0', 'expect': accounts[0]},
      {'var': 'ownerOf.b1', 'expect': accounts[1]},
    ]
    let bearBucksStateChanges = [
      {'var': 'totalSupply', 'expect': startBalance*2},
      {'var': 'balanceOf.a0', 'expect': startBalance},
      {'var': 'balanceOf.a1', 'expect': startBalance},
      {'var': 'allowance.a0.cb', 'expect': feedingCost},
    ]
    await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  })

  it('should removeBet with same bear', async function () {
    let bear1 = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bear1, 0)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})

    await bearBucks.approve(cryptoBears.address, feedingCost, {from: accounts[0]})
    await cryptoBears.placeBet(bear1, bear1, feedingCost, {from: accounts[0]})
    let event = await cryptoBears.removeBet(bear1, bear1, {from: accounts[0]})
    checkEvent('betRemoved', event, [new BigNumber(bear1), new BigNumber(bear1)])
    let cryptoBearsStateChanges = [
      {'var': 'balanceOf.a0', 'expect': 1},
      {'var': 'ownerOf.b0', 'expect': accounts[0]},
    ]
    let bearBucksStateChanges = [
      {'var': 'totalSupply', 'expect': startBalance},
      {'var': 'balanceOf.a0', 'expect': startBalance},
      {'var': 'allowance.a0.cb', 'expect': feedingCost},
    ]
    await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  })

  it('should removeBet with same owner different bear', async function () {
    let bear1 = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bear1, 0)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})
    let bear2 = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bear2, 1)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})

    await bearBucks.approve(cryptoBears.address, feedingCost, {from: accounts[0]})
    await cryptoBears.placeBet(bear1, bear2, feedingCost, {from: accounts[0]})
    let event = await cryptoBears.removeBet(bear1, bear2, {from: accounts[0]})
    checkEvent('betRemoved', event, [new BigNumber(bear1), new BigNumber(bear2)])
    let cryptoBearsStateChanges = [
      {'var': 'balanceOf.a0', 'expect': 2},
      {'var': 'ownerOf.b0', 'expect': accounts[0]},
      {'var': 'ownerOf.b1', 'expect': accounts[0]},
    ]
    let bearBucksStateChanges = [
      {'var': 'totalSupply', 'expect': startBalance*2},
      {'var': 'balanceOf.a0', 'expect': startBalance*2},
      {'var': 'allowance.a0.cb', 'expect': feedingCost},
    ]
    await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  })

  it('should commit to bet', async function () {
    let bear1 = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bear1, 0)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})
    let bear2 = (await cryptoBears.newBear.call(genes, accounts[1], name, {from: accounts[5]})).toNumber()
    assert.equal(bear2, 1)
    await cryptoBears.newBear(genes, accounts[1], name, {from: accounts[5]})

    await bearBucks.approve(cryptoBears.address, feedingCost, {from: accounts[0]})
    await cryptoBears.placeBet(bear1, bear2, feedingCost, {from: accounts[0]})
    await bearBucks.approve(cryptoBears.address, feedingCost, {from: accounts[1]})
    await cryptoBears.placeBet(bear2, bear1, feedingCost, {from: accounts[1]})

    let r1 = generateSecret()
    let hash_r1 = generateHash(r1)
    await cryptoBears.commit(bear1, bear2, hash_r1, {from: accounts[0]})

    let cryptoBearsStateChanges = [
      {'var': 'balanceOf.a0', 'expect': 1},
      {'var': 'balanceOf.a1', 'expect': 1},
      {'var': 'ownerOf.b0', 'expect': accounts[0]},
      {'var': 'ownerOf.b1', 'expect': accounts[1]},
      {'var': 'bets.b0.b1', 'expect': feedingCost},
      {'var': 'bets.b1.b0', 'expect': feedingCost},
      {'var': 'commitments.b0.b1', 'expect': hash_r1},
      {'var': 'committed.b0.b1', 'expect': true},
    ]
    let bearBucksStateChanges = [
      {'var': 'totalSupply', 'expect': startBalance*2},
      {'var': 'balanceOf.a0', 'expect': startBalance},
      {'var': 'balanceOf.a1', 'expect': startBalance},
      {'var': 'betSum.a0', 'expect': feedingCost},
      {'var': 'betSum.a1', 'expect': feedingCost},
      {'var': 'allowance.a0.cb', 'expect': feedingCost},
      {'var': 'allowance.a1.cb', 'expect': feedingCost},
    ]
    await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  })

  it('should reveal secret', async function () {
    let bear1 = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bear1, 0)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})
    let bear2 = (await cryptoBears.newBear.call(genes, accounts[1], name, {from: accounts[5]})).toNumber()
    assert.equal(bear2, 1)
    await cryptoBears.newBear(genes, accounts[1], name, {from: accounts[5]})

    await bearBucks.approve(cryptoBears.address, feedingCost, {from: accounts[0]})
    await cryptoBears.placeBet(bear1, bear2, feedingCost, {from: accounts[0]})
    await bearBucks.approve(cryptoBears.address, feedingCost, {from: accounts[1]})
    await cryptoBears.placeBet(bear2, bear1, feedingCost, {from: accounts[1]})

    let r1 = generateSecret()
    let hash_r1 = generateHash(r1)
    await cryptoBears.commit(bear1, bear2, hash_r1, {from: accounts[0]})

    let r2 = generateSecret()
    let hash_r2 = generateHash(r2)
    await cryptoBears.commit(bear2, bear1, hash_r2, {from: accounts[1]})

    await cryptoBears.reveal(bear1, bear2, r1, {from: accounts[0]})

    let cryptoBearsStateChanges = [
      {'var': 'balanceOf.a0', 'expect': 1},
      {'var': 'balanceOf.a1', 'expect': 1},
      {'var': 'ownerOf.b0', 'expect': accounts[0]},
      {'var': 'ownerOf.b1', 'expect': accounts[1]},
      {'var': 'bets.b0.b1', 'expect': feedingCost},
      {'var': 'bets.b1.b0', 'expect': feedingCost},
      {'var': 'commitments.b0.b1', 'expect': hash_r1},
      {'var': 'committed.b0.b1', 'expect': true},
      {'var': 'commitments.b1.b0', 'expect': hash_r2},
      {'var': 'committed.b1.b0', 'expect': true},
      {'var': 'secrets.b0.b1', 'expect': r1},
      {'var': 'revealed.b0.b1', 'expect': true},
    ]
    let bearBucksStateChanges = [
      {'var': 'totalSupply', 'expect': startBalance*2},
      {'var': 'balanceOf.a0', 'expect': startBalance},
      {'var': 'balanceOf.a1', 'expect': startBalance},
      {'var': 'betSum.a0', 'expect': feedingCost},
      {'var': 'betSum.a1', 'expect': feedingCost},
      {'var': 'allowance.a0.cb', 'expect': feedingCost},
      {'var': 'allowance.a1.cb', 'expect': feedingCost},
    ]
    await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  })

  it('should flip coin and pay winner once both bears reveal', async function () {
    let bear1 = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bear1, 0)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})
    let bear2 = (await cryptoBears.newBear.call(genes, accounts[1], name, {from: accounts[5]})).toNumber()
    assert.equal(bear2, 1)
    await cryptoBears.newBear(genes, accounts[1], name, {from: accounts[5]})

    await bearBucks.approve(cryptoBears.address, feedingCost, {from: accounts[0]})
    await cryptoBears.placeBet(bear1, bear2, feedingCost, {from: accounts[0]})
    await bearBucks.approve(cryptoBears.address, feedingCost, {from: accounts[1]})
    await cryptoBears.placeBet(bear2, bear1, feedingCost, {from: accounts[1]})

    let r1 = generateSecret()
    let hash_r1 = generateHash(r1)
    await cryptoBears.commit(bear1, bear2, hash_r1, {from: accounts[0]})

    let r2 = generateSecret()
    let hash_r2 = generateHash(r2)
    await cryptoBears.commit(bear2, bear1, hash_r2, {from: accounts[1]})

    let outcome = calculateWinner(bear2, bear1, r1, r2)

    let balance_a0
    let balance_a1
    let allowance_a0_cb
    let allowance_a1_cb
    if (outcome[0] == bear1) {
      balance_a0 = startBalance + feedingCost
      balance_a1 = startBalance - feedingCost
      allowance_a0_cb = feedingCost
      allowance_a1_cb = 0
    } else {
      balance_a0 = startBalance - feedingCost
      balance_a1 = startBalance + feedingCost
      allowance_a0_cb = 0
      allowance_a1_cb = feedingCost
    }

    await cryptoBears.reveal(bear1, bear2, r1, {from: accounts[0]})
    let event = await cryptoBears.reveal(bear2, bear1, r2, {from: accounts[1]})
    checkEvent('betSettled', event, outcome.map((e) => {
      return new BigNumber(e)
    }))

    let cryptoBearsStateChanges = [
      {'var': 'balanceOf.a0', 'expect': 1},
      {'var': 'balanceOf.a1', 'expect': 1},
      {'var': 'ownerOf.b0', 'expect': accounts[0]},
      {'var': 'ownerOf.b1', 'expect': accounts[1]},
    ]
    let bearBucksStateChanges = [
      {'var': 'totalSupply', 'expect': startBalance*2},
      {'var': 'balanceOf.a0', 'expect': balance_a0},
      {'var': 'balanceOf.a1', 'expect': balance_a1},
      {'var': 'allowance.a0.cb', 'expect': allowance_a0_cb},
      {'var': 'allowance.a1.cb', 'expect': allowance_a1_cb},
    ]
    await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  })

  it('should payWinner for same-bear-bet without changing balance', async function () {
    let bear1 = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bear1, 0)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})

    await bearBucks.approve(cryptoBears.address, feedingCost, {from: accounts[0]})
    await cryptoBears.placeBet(bear1, bear1, feedingCost, {from: accounts[0]})

    let r1 = generateSecret()
    let hash_r1 = generateHash(r1)
    await cryptoBears.commit(bear1, bear1, hash_r1, {from: accounts[0]})

    await cryptoBears.reveal(bear1, bear1, r1, {from: accounts[0]})

    let cryptoBearsStateChanges = [
      {'var': 'balanceOf.a0', 'expect': 1},
      {'var': 'ownerOf.b0', 'expect': accounts[0]},
    ]
    let bearBucksStateChanges = [
      {'var': 'totalSupply', 'expect': startBalance},
      {'var': 'balanceOf.a0', 'expect': startBalance},
    ]
    await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  })

  it('should payWinner for same-owner-different-bear-bet without changing balance', async function () {
    let bear1 = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bear1, 0)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})
    let bear2 = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bear2, 1)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})

    await bearBucks.approve(cryptoBears.address, feedingCost*2, {from: accounts[0]})
    await cryptoBears.placeBet(bear1, bear2, feedingCost, {from: accounts[0]})
    await cryptoBears.placeBet(bear2, bear1, feedingCost, {from: accounts[0]})

    let r1 = generateSecret()
    let hash_r1 = generateHash(r1)
    await cryptoBears.commit(bear1, bear2, hash_r1, {from: accounts[0]})

    let r2 = generateSecret()
    let hash_r2 = generateHash(r2)
    await cryptoBears.commit(bear2, bear1, hash_r2, {from: accounts[0]})

    let outcome = calculateWinner(bear2, bear1, r1, r2)

    await cryptoBears.reveal(bear1, bear2, r1, {from: accounts[0]})
    let event = await cryptoBears.reveal(bear2, bear1, r2, {from: accounts[0]})
    checkEvent('betSettled', event, outcome.map((e) => {
      return new BigNumber(e)
    }))

    let cryptoBearsStateChanges = [
      {'var': 'balanceOf.a0', 'expect': 2},
      {'var': 'ownerOf.b0', 'expect': accounts[0]},
      {'var': 'ownerOf.b1', 'expect': accounts[0]},
    ]
    let bearBucksStateChanges = [
      {'var': 'totalSupply', 'expect': startBalance*2},
      {'var': 'balanceOf.a0', 'expect': startBalance*2},
      {'var': 'allowance.a0.cb', 'expect': feedingCost},
    ]
    await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  })

})
