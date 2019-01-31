const utils = require('./Utils')

const CryptoBears = utils.CryptoBears
const BearBucks = utils.BearBucks
const checkState = utils.checkState
const expectRevert = utils.expectRevert

const amount = 100

contract('BearBucksNegativeTests', async function (accounts) {

  // This runs before each test.
  beforeEach('Make fresh contract', async function () {
    // We let accounts[5] represent the CryptoBearsContract.
    bearBucks = await BearBucks.new({from: accounts[5]})//{from: BLANK specifies msg.sender}
  })

  it('should have correct initial state', async function () {
    await checkState([bearBucks], [[]], accounts)
  })

  it('should fail to mint if not CryptoBearsContract', async function () {
    await expectRevert(bearBucks.mint(accounts[0], amount, {from: accounts[2]}))
    await checkState([bearBucks], [[]], accounts)
  })

  it('should fail to burn if not CryptoBearsContract', async function () {
    await bearBucks.mint(accounts[0], amount, {from: accounts[5]})
    await expectRevert(bearBucks.burn(accounts[0], amount, {from: accounts[2]}))

    var stateChanges = [
      {'var': 'totalSupply', 'expect': amount},
      {'var': 'balanceOf.a0', 'expect': amount},
    ]
    await checkState([bearBucks], [stateChanges], accounts)
  })

  it('should fail to placeBet if not CryptoBearsContract', async function () {
    await bearBucks.mint(accounts[0], amount, {from: accounts[5]})
    await bearBucks.approve(accounts[5], amount, {from: accounts[0]})
    await expectRevert(bearBucks.placeBet(accounts[0], amount, {from: accounts[3]}))

    var stateChanges = [
      {'var': 'totalSupply', 'expect': amount},
      {'var': 'balanceOf.a0', 'expect': amount},
      {'var': 'allowance.a0.cb', 'expect': amount}
    ]
    await checkState([bearBucks], [stateChanges], accounts)
  })

  it('should fail to placeBet greater than balance', async function () {
    await bearBucks.mint(accounts[0], amount, {from: accounts[5]})
    await bearBucks.approve(accounts[5], amount+1, {from: accounts[0]})
    await expectRevert(bearBucks.placeBet(accounts[0], amount+1, {from: accounts[5]}))

    var stateChanges = [
      {'var': 'totalSupply', 'expect': amount},
      {'var': 'balanceOf.a0', 'expect': amount},
      {'var': 'allowance.a0.cb', 'expect': amount+1}
    ]
    await checkState([bearBucks], [stateChanges], accounts)
  })

  it('should fail to placeBet if allowance of CryptoBearsContract is less than betSum', async function () {
    await bearBucks.mint(accounts[0], amount, {from: accounts[5]})
    await bearBucks.approve(accounts[5], amount-1, {from: accounts[0]})
    await expectRevert(bearBucks.placeBet(accounts[0], amount, {from: accounts[5]}))

    var stateChanges = [
      {'var': 'totalSupply', 'expect': amount},
      {'var': 'balanceOf.a0', 'expect': amount},
      {'var': 'allowance.a0.cb', 'expect': amount-1}
    ]
    await checkState([bearBucks], [stateChanges], accounts)
  })

  it('should fail to placeBet if betSum would be greater than balance', async function () {
    await bearBucks.mint(accounts[0], amount, {from: accounts[5]})
    await bearBucks.approve(accounts[5], amount+1, {from: accounts[0]})
    await bearBucks.placeBet(accounts[0], amount, {from: accounts[5]})
    await expectRevert(bearBucks.placeBet(accounts[0], 1, {from: accounts[5]}))

    var stateChanges = [
      {'var': 'totalSupply', 'expect': amount},
      {'var': 'balanceOf.a0', 'expect': amount},
      {'var': 'allowance.a0.cb', 'expect': amount+1},
      {'var': 'betSum.a0', 'expect': amount}
    ]
    await checkState([bearBucks], [stateChanges], accounts)
  })

  it('should fail to removeBet if not CryptoBearsContract', async function () {
    await bearBucks.mint(accounts[0], amount, {from: accounts[5]})
    await bearBucks.approve(accounts[5], amount, {from: accounts[0]})
    await bearBucks.placeBet(accounts[0], amount, {from: accounts[5]})
    await expectRevert(bearBucks.removeBet(accounts[0], amount, {from: accounts[3]}))

    var stateChanges = [
      {'var': 'totalSupply', 'expect': amount},
      {'var': 'balanceOf.a0', 'expect': amount},
      {'var': 'allowance.a0.cb', 'expect': amount},
      {'var': 'betSum.a0', 'expect': amount}
    ]
    await checkState([bearBucks], [stateChanges], accounts)
  })

  it('should fail to approve amount less than betSum for CryptoBearsContract', async function () {
    await bearBucks.mint(accounts[0], amount, {from: accounts[5]})
    await bearBucks.approve(accounts[5], amount, {from: accounts[0]})
    await bearBucks.placeBet(accounts[0], amount, {from: accounts[5]})
    await expectRevert(bearBucks.approve(accounts[5], amount-1, {from: accounts[0]}))

    var stateChanges = [
      {'var': 'totalSupply', 'expect': amount},
      {'var': 'balanceOf.a0', 'expect': amount},
      {'var': 'allowance.a0.cb', 'expect': amount},
      {'var': 'betSum.a0', 'expect': amount}
    ]
    await checkState([bearBucks], [stateChanges], accounts)
  })

})
