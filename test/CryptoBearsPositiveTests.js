const utils = require('./Utils')
const BigNumber = require('bignumber.js')

const CryptoBears = utils.CryptoBears
const BearBucks = utils.BearBucks
const checkState = utils.checkState
const zero = utils.zero

const startBalance = 100
const feedingCost = 20
const feedingInterval = 60
const genes = 0
const name = 'Bruno'


contract('CryptoBearsPositiveTests', async function (accounts) {

  beforeEach('Make fresh contract', async function () {
    cryptoBears = await CryptoBears.new( // We let accounts[5] represent the CryptoBearMinter
      startBalance, feedingCost, feedingInterval, accounts[5])
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

})
