const utils = require('./Utils')

const CryptoBears = utils.CryptoBears
const BearBucks = utils.BearBucks
const checkState = utils.checkState
const expectRevert = utils.expectRevert

const amount = 100

contract('ERC20NegativeTests', async function (accounts) {

  beforeEach('Make fresh contract', async function () {
    // We let accounts[5] represent the CryptoBearsContract.
    bearBucks = await BearBucks.new({from: accounts[5]})
  })

  it('should have correct initial state', async function () {
    await checkState([bearBucks], [[]], accounts)
  })

  it('should fail to approve to address(0)', async function () {
    await bearBucks.mint(accounts[0], amount, {from: accounts[5]})
    await expectRevert(bearBucks.approve('0x0', amount, {from: accounts[0]}))

    var stateChanges = [
      {'var': 'totalSupply', 'expect': amount},
      {'var': 'balanceOf.a0', 'expect': amount}
    ]
    await checkState([bearBucks], [stateChanges], accounts)
  })

  it('should fail to transferFrom more than spender allowance', async function () {
    await bearBucks.mint(accounts[0], amount, {from: accounts[5]})
    await bearBucks.approve(accounts[1], amount-1, {from: accounts[0]})
    await expectRevert(
      bearBucks.transferFrom(accounts[0], accounts[2], amount, {from: accounts[1]})
    )

    var stateChanges = [
      {'var': 'totalSupply', 'expect': amount},
      {'var': 'balanceOf.a0', 'expect': amount},
      {'var': 'allowance.a0.a1', 'expect': amount-1}
    ]
    await checkState([bearBucks], [stateChanges], accounts)
  })

  //NOTE: could there be a betting vulnerability with this? no check on approve
  it('should fail to transferFrom more than owner balance', async function () {
    await bearBucks.mint(accounts[0], amount, {from: accounts[5]})
    await bearBucks.approve(accounts[1], amount+1, {from: accounts[0]})
    await expectRevert(
      bearBucks.transferFrom(accounts[0], accounts[2], amount+1, {from: accounts[1]})
    )

    var stateChanges = [
      {'var': 'totalSupply', 'expect': amount},
      {'var': 'balanceOf.a0', 'expect': amount},
      {'var': 'allowance.a0.a1', 'expect': amount+1}
    ]
    await checkState([bearBucks], [stateChanges], accounts)
  })

  it('should fail to transferFrom to address(0)', async function () {
    await bearBucks.mint(accounts[0], amount, {from: accounts[5]})
    await bearBucks.approve(accounts[1], amount, {from: accounts[0]})
    await expectRevert(
      bearBucks.transferFrom(accounts[0], '0x0', amount, {from: accounts[1]})
    )

    var stateChanges = [
      {'var': 'totalSupply', 'expect': amount},
      {'var': 'balanceOf.a0', 'expect': amount},
      {'var': 'allowance.a0.a1', 'expect': amount}
    ]
    await checkState([bearBucks], [stateChanges], accounts)
  })

  //NOTE: what about self transfers??
  it('should fail to transfer more than balance', async function () {
    await expectRevert(bearBucks.transfer(accounts[1], amount), {from: accounts[0]})
    await checkState([bearBucks], [[]], accounts)
  })

  it('should fail to transfer to address(0)', async function () {
    await bearBucks.mint(accounts[0], amount, {from: accounts[5]})
    await expectRevert(bearBucks.transfer('0x0', amount, {from: accounts[0]}))

    var stateChanges = [
      {'var': 'totalSupply', 'expect': amount},
      {'var': 'balanceOf.a0', 'expect': amount},
    ]
    await checkState([bearBucks], [stateChanges], accounts)
  })

  it('should fail to mint to address(0)', async function () {
    await expectRevert(bearBucks.mint('0x0', amount, {from: accounts[5]}))
    await checkState([bearBucks], [[]], accounts)
  })

  it('should fail to burn from address(0)', async function () {
    await expectRevert(bearBucks.burn('0x0', 0, {from: accounts[5]}))
    await checkState([bearBucks], [[]], accounts)
  })

  it('should fail to burn more than balance', async function () {
    await expectRevert(bearBucks.burn(accounts[0], amount, {from: accounts[5]}))
    await checkState([bearBucks], [[]], accounts)
  })

})
