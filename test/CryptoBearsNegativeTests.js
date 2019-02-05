const utils = require('./Utils')
const BigNumber = require('bignumber.js')

const CryptoBears = utils.CryptoBears
const BearBucks = utils.BearBucks
const checkState = utils.checkState
const expectRevert = utils.expectRevert
const zero = utils.zero
const pause = utils.pause

const startBalance = 100
const feedingCost = 20
const feedingInterval = 3000 // 1000ms == 1sec
const genes = 0
const name = 'Bruno'


contract('CryptoBearsNegativeTests', async function (accounts) {

  beforeEach('Make fresh contract', async function () {
    cryptoBears = await CryptoBears.new( // We let accounts[5] represent the referee/minter.
      startBalance, feedingCost, feedingInterval/1000, accounts[5])
    // .at(...) gets contract instance at the passed address.
    bearBucks = BearBucks.at(await cryptoBears._BearBucksContract.call())
  })

  it('should have correct initial state', async function () {
    await checkState([cryptoBears, bearBucks], [[], []], accounts)
  })

  it('should fail to create newBear if msg.sender is not minter', async function () {
    await expectRevert(cryptoBears.newBear(genes, accounts[0], name, {from: accounts[6]}))
    await checkState([cryptoBears, bearBucks], [[], []], accounts)
  })

  it('should fail to create newBear for address(0)', async function () {
    await expectRevert(cryptoBears.newBear(genes, '0x0', name, {from: accounts[5]}))
    await checkState([cryptoBears, bearBucks], [[], []], accounts)
  })

  it('should fail to feed if bear does not exist', async function () {
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})
    await expectRevert(cryptoBears.feed(1, feedingCost, {from: accounts[0]}))
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

  it('should fail to feed if msg.sender is not owner', async function () {
    var bearID = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bearID, 0)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})
    await cryptoBears.newBear(genes, accounts[1], name, {from: accounts[5]})
    await expectRevert(cryptoBears.feed(0, feedingCost, {from: accounts[1]}))
    var cryptoBearsStateChanges = [
      {'var': 'balanceOf.a0', 'expect': 1},
      {'var': 'balanceOf.a1', 'expect': 1},
      {'var': 'ownerOf.b0', 'expect': accounts[0]},
      {'var': 'ownerOf.b1', 'expect': accounts[1]},
    ]
    var bearBucksStateChanges = [
      {'var': 'totalSupply', 'expect': 2*startBalance},
      {'var': 'balanceOf.a0', 'expect': startBalance},
      {'var': 'balanceOf.a1', 'expect': startBalance},
    ]
    await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  })

  it('should fail to feed if BearBucks balance is less than amount', async function () {
    var bearID = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bearID, 0)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})

    await expectRevert(cryptoBears.feed(0, startBalance+1, {from: accounts[0]}))

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

  it('should fail to feed if balance would be less than betSum', async function () {
    var bear1 = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bear1, 0)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})
    var bear2 = (await cryptoBears.newBear.call(genes, accounts[1], name, {from: accounts[5]})).toNumber()
    assert.equal(bear2, 1)
    await cryptoBears.newBear(genes, accounts[1], name, {from: accounts[5]})

    await bearBucks.approve(cryptoBears.address, startBalance, {from: accounts[0]})
    await cryptoBears.placeBet(bear1, bear2, startBalance, {from: accounts[0]})

    await expectRevert(cryptoBears.feed(0, feedingCost, {from: accounts[0]}))

    var cryptoBearsStateChanges = [
      {'var': 'balanceOf.a0', 'expect': 1},
      {'var': 'balanceOf.a1', 'expect': 1},
      {'var': 'ownerOf.b0', 'expect': accounts[0]},
      {'var': 'ownerOf.b1', 'expect': accounts[1]},
      {'var': 'bets.b0.b1', 'expect': startBalance},
    ]
    var bearBucksStateChanges = [
      {'var': 'totalSupply', 'expect': startBalance*2},
      {'var': 'balanceOf.a0', 'expect': startBalance},
      {'var': 'balanceOf.a1', 'expect': startBalance},
      {'var': 'betSum.a0', 'expect': startBalance},
      {'var': 'allowance.a0.cb', 'expect': startBalance},
    ]
    await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  })

  it('should fail to feed if amount is less than feedingCost', async function () {
    var bearID = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bearID, 0)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})

    await expectRevert(cryptoBears.feed(0, feedingCost-1, {from: accounts[0]}))

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

  it('should fail to getMealsNeeded if bear does not exist', async function () {
    await expectRevert(cryptoBears.getMealsNeeded(0))
    await checkState([cryptoBears, bearBucks], [[], []], accounts)
  })

  it('should fail to getTimeLastFed if bear does not exist', async function () {
    await expectRevert(cryptoBears.getTimeLastFed(0))
    await checkState([cryptoBears, bearBucks], [[], []], accounts)
  })

  it('should fail to getTimeOfBirth if bear does not exist', async function () {
    await expectRevert(cryptoBears.getTimeOfBirth(0))
    await checkState([cryptoBears, bearBucks], [[], []], accounts)
  })

  it('should fail to placeBet if either bear does not exist', async function () {
    var bearID = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bearID, 0)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})

    await bearBucks.approve(cryptoBears.address, feedingCost, {from: accounts[0]})
    await expectRevert(cryptoBears.placeBet(0, 1, feedingCost, {from: accounts[0]}))
    await expectRevert(cryptoBears.placeBet(1, 0, feedingCost, {from: accounts[0]}))

    var cryptoBearsStateChanges = [
      {'var': 'balanceOf.a0', 'expect': 1},
      {'var': 'ownerOf.b0', 'expect': accounts[0]}
    ]
    var bearBucksStateChanges = [
      {'var': 'totalSupply', 'expect': startBalance},
      {'var': 'balanceOf.a0', 'expect': startBalance},
      {'var': 'allowance.a0.cb', 'expect': feedingCost},
    ]
    await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  })

  it('should fail to placeBet if bear is hungry', async function () {
    var bear1 = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bear1, 0)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})
    var bear2 = (await cryptoBears.newBear.call(genes, accounts[1], name, {from: accounts[5]})).toNumber()
    assert.equal(bear2, 1)
    await cryptoBears.newBear(genes, accounts[1], name, {from: accounts[5]})

    await bearBucks.approve(cryptoBears.address, feedingCost, {from: accounts[0]})
    await pause(feedingInterval)
    await expectRevert(cryptoBears.placeBet(bear1, bear2, feedingCost, {from: accounts[0]}))
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

  it('should fail to placeBet if msg.sender is not owner', async function () {
    var bear1 = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bear1, 0)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})
    var bear2 = (await cryptoBears.newBear.call(genes, accounts[1], name, {from: accounts[5]})).toNumber()
    assert.equal(bear2, 1)
    await cryptoBears.newBear(genes, accounts[1], name, {from: accounts[5]})

    await bearBucks.approve(cryptoBears.address, feedingCost, {from: accounts[1]})
    await expectRevert(cryptoBears.placeBet(bear1, bear2, feedingCost, {from: accounts[1]}))

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
      {'var': 'allowance.a1.cb', 'expect': feedingCost},
    ]
    await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  })

  it('should fail to placeBet of 0', async function () {
    var bear1 = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bear1, 0)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})
    var bear2 = (await cryptoBears.newBear.call(genes, accounts[1], name, {from: accounts[5]})).toNumber()
    assert.equal(bear2, 1)
    await cryptoBears.newBear(genes, accounts[1], name, {from: accounts[5]})

    await bearBucks.approve(cryptoBears.address, feedingCost, {from: accounts[0]})
    await expectRevert(cryptoBears.placeBet(bear1, bear2, 0, {from: accounts[0]}))

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

  it('should fail to placeBet with 2nd value', async function () {
    var bear1 = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bear1, 0)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})
    var bear2 = (await cryptoBears.newBear.call(genes, accounts[1], name, {from: accounts[5]})).toNumber()
    assert.equal(bear2, 1)
    await cryptoBears.newBear(genes, accounts[1], name, {from: accounts[5]})

    await bearBucks.approve(cryptoBears.address, feedingCost*1.5, {from: accounts[0]})
    await cryptoBears.placeBet(bear1, bear2, feedingCost, {from: accounts[0]})
    await expectRevert(cryptoBears.placeBet(bear1, bear2, feedingCost/2, {from: accounts[0]}))
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
      {'var': 'allowance.a0.cb', 'expect': feedingCost*1.5},
    ]
    await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  })

  it('should fail to placeBet if amount is greater than BearBucks balance', async function () {
    var bear1 = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bear1, 0)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})
    var bear2 = (await cryptoBears.newBear.call(genes, accounts[1], name, {from: accounts[5]})).toNumber()
    assert.equal(bear2, 1)
    await cryptoBears.newBear(genes, accounts[1], name, {from: accounts[5]})

    await bearBucks.approve(cryptoBears.address, startBalance+1, {from: accounts[0]})
    await expectRevert(cryptoBears.placeBet(bear1, bear2, startBalance+1, {from: accounts[0]}))
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
      {'var': 'allowance.a0.cb', 'expect': startBalance+1},
    ]
    await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  })

  it('should fail to placeBet without approving CryptoBearsContract', async function () {
    var bear1 = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bear1, 0)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})
    var bear2 = (await cryptoBears.newBear.call(genes, accounts[1], name, {from: accounts[5]})).toNumber()
    assert.equal(bear2, 1)
    await cryptoBears.newBear(genes, accounts[1], name, {from: accounts[5]})

    await expectRevert(cryptoBears.placeBet(bear1, bear2, feedingCost, {from: accounts[0]}))
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

  it('should fail to removeBet if msg.sender is not owner', async function () {
    var bear1 = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bear1, 0)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})
    var bear2 = (await cryptoBears.newBear.call(genes, accounts[1], name, {from: accounts[5]})).toNumber()
    assert.equal(bear2, 1)
    await cryptoBears.newBear(genes, accounts[1], name, {from: accounts[5]})

    await bearBucks.approve(cryptoBears.address, feedingCost, {from: accounts[0]})
    await cryptoBears.placeBet(bear1, bear2, feedingCost, {from: accounts[0]})
    await expectRevert(cryptoBears.removeBet(bear1, bear2, {from: accounts[1]}))
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

  it('should fail to removeBet if no bet has been placed', async function () {
    var bearID = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bearID, 0)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})

    await expectRevert(cryptoBears.removeBet(0, 1, {from: accounts[0]}))

    var cryptoBearsStateChanges = [
      {'var': 'balanceOf.a0', 'expect': 1},
      {'var': 'ownerOf.b0', 'expect': accounts[0]}
    ]
    var bearBucksStateChanges = [
      {'var': 'totalSupply', 'expect': startBalance},
      {'var': 'balanceOf.a0', 'expect': startBalance}
    ]
    await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  })

  it('should fail to payWinner if msg.sender is not referee', async function () {
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

    await expectRevert(cryptoBears.payWinner(bear1, bear2, {from: accounts[4]}))

    var cryptoBearsStateChanges = [
      {'var': 'balanceOf.a0', 'expect': 1},
      {'var': 'balanceOf.a1', 'expect': 1},
      {'var': 'ownerOf.b0', 'expect': accounts[0]},
      {'var': 'ownerOf.b1', 'expect': accounts[1]},
      {'var': 'bets.b0.b1', 'expect': feedingCost},
      {'var': 'bets.b1.b0', 'expect': feedingCost},
    ]
    var bearBucksStateChanges = [
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

  it('should fail to payWinner if both bets have not been placed', async function () {
    var bear1 = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bear1, 0)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})
    var bear2 = (await cryptoBears.newBear.call(genes, accounts[1], name, {from: accounts[5]})).toNumber()
    assert.equal(bear2, 1)
    await cryptoBears.newBear(genes, accounts[1], name, {from: accounts[5]})

    await bearBucks.approve(cryptoBears.address, feedingCost, {from: accounts[0]})
    await cryptoBears.placeBet(bear1, bear2, feedingCost, {from: accounts[0]})
    await expectRevert(cryptoBears.payWinner(bear1, bear2, {from: accounts[5]}))

    await cryptoBears.removeBet(bear1, bear2, {from: accounts[0]})
    await bearBucks.approve(cryptoBears.address, feedingCost, {from: accounts[1]})
    await cryptoBears.placeBet(bear2, bear1, feedingCost, {from: accounts[1]})
    await expectRevert(cryptoBears.payWinner(bear1, bear2, {from: accounts[5]}))


    var cryptoBearsStateChanges = [
      {'var': 'balanceOf.a0', 'expect': 1},
      {'var': 'balanceOf.a1', 'expect': 1},
      {'var': 'ownerOf.b0', 'expect': accounts[0]},
      {'var': 'ownerOf.b1', 'expect': accounts[1]},
      {'var': 'bets.b1.b0', 'expect': feedingCost},
    ]
    var bearBucksStateChanges = [
      {'var': 'totalSupply', 'expect': startBalance*2},
      {'var': 'balanceOf.a0', 'expect': startBalance},
      {'var': 'balanceOf.a1', 'expect': startBalance},
      {'var': 'betSum.a1', 'expect': feedingCost},
      {'var': 'allowance.a0.cb', 'expect': feedingCost},
      {'var': 'allowance.a1.cb', 'expect': feedingCost},
    ]
    await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  })

})
