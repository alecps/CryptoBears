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


contract('ERC721PositiveTests', async function (accounts) {

  beforeEach('Make fresh contract', async function () {
    cryptoBears = await CryptoBears.new( // We let accounts[5] represent the manager
      startBalance, feedingCost, feedingInterval/1000, accounts[5])
    bearBucks = BearBucks.at(await cryptoBears._BearBucksContract.call())
  })

  it('should have correct initial state', async function () {
    await checkState([cryptoBears, bearBucks], [[], []], accounts)
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
    let event = await cryptoBears.setApprovalForAll(accounts[1], true, {from: accounts[0]})
    checkEvent('ApprovalForAll', event, [accounts[0], accounts[1], true])

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
    let event = await cryptoBears.approve(accounts[1], bearID, {from: accounts[0]})
    checkEvent('Approval', event, [accounts[0], accounts[1], new BigNumber(bearID)])

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
    let event = await cryptoBears.approve(accounts[1], bearID, {from: accounts[2]})
    checkEvent('Approval', event, [accounts[0], accounts[1], new BigNumber(bearID)])

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

  it('should transferFrom when msg.sender is owner', async function () {
    var bearID = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bearID, 0)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})
    let event = await cryptoBears.transferFrom(accounts[0], accounts[2], bearID, {from: accounts[0]})
    checkEvent('Transfer', event, [accounts[0], accounts[2], new BigNumber(bearID)])

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

  it('should transferFrom to self without changing state when msg.sender is owner', async function () {
    var bearID = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bearID, 0)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})
    let event = await cryptoBears.transferFrom(accounts[0], accounts[0], bearID, {from: accounts[0]})
    checkEvent('Transfer', event, [accounts[0], accounts[0], new BigNumber(bearID)])

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

  it('should transferFrom when msg.sender is approved', async function () {
    var bearID = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bearID, 0)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})
    await cryptoBears.approve(accounts[1], bearID, {from: accounts[0]})
    let event = await cryptoBears.transferFrom(accounts[0], accounts[2], bearID, {from: accounts[1]})
    checkEvent('Transfer', event, [accounts[0], accounts[2], new BigNumber(bearID)])

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

  it('should transferFrom to self without changing state when msg.sender is approved', async function () {
    var bearID = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bearID, 0)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})
    await cryptoBears.approve(accounts[1], bearID, {from: accounts[0]})
    let event = await cryptoBears.transferFrom(accounts[0], accounts[1], bearID, {from: accounts[1]})
    checkEvent('Transfer', event, [accounts[0], accounts[1], new BigNumber(bearID)])

    var cryptoBearsStateChanges = [
      {'var': 'balanceOf.a1', 'expect': 1},
      {'var': 'ownerOf.b0', 'expect': accounts[1]}
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
    let event = await cryptoBears.transferFrom(accounts[0], accounts[2], bearID, {from: accounts[1]})
    checkEvent('Transfer', event, [accounts[0], accounts[2], new BigNumber(bearID)])

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

  it('should transferFrom to self without chaning state when msg.sender isApprovedForAll', async function () {
    var bearID = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bearID, 0)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})
    await cryptoBears.setApprovalForAll(accounts[1], true, {from: accounts[0]})
    let event = await cryptoBears.transferFrom(accounts[0], accounts[1], bearID, {from: accounts[1]})
    checkEvent('Transfer', event, [accounts[0], accounts[1], new BigNumber(bearID)])

    var cryptoBearsStateChanges = [
      {'var': 'balanceOf.a1', 'expect': 1},
      {'var': 'ownerOf.b0', 'expect': accounts[1]},
      {'var': 'isApprovedForAll.a0.a1', 'expect': true},
    ]
    var bearBucksStateChanges = [
      {'var': 'totalSupply', 'expect': startBalance},
      {'var': 'balanceOf.a0', 'expect': startBalance}
    ]
    await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  })

})
