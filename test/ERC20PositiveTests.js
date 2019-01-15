const utils = require('./Utils')

const CryptoBears = utils.CryptoBears
const BearBucks = utils.BearBucks
const checkState = utils.checkState

const amount = 100;

contract('ERC20PositiveTests', async function (accounts) {

  beforeEach('Make fresh contract', async function () {
    // We let accounts[5] represent the CryptoBearsContract.
    bearBucks = await BearBucks.new({from: accounts[5]})
  })

  it('should have correct initial state', async function () {
    await checkState([bearBucks], [[]], accounts)
  })

  it('should return totalSupply without changing state', async function () {
    assert.equal((await bearBucks.totalSupply()).toNumber(), 0)
    await checkState([bearBucks], [[]], accounts)
  })

  it('should return balanceOf without changing state', async function () {
    assert.equal((await bearBucks.balanceOf(accounts[0])).toNumber(), 0)
    await checkState([bearBucks], [[]], accounts)
  })

  it('should return allowance without changing state', async function () {
    assert.equal((await bearBucks.allowance(accounts[0], accounts[1])).toNumber(), 0)
    await checkState([bearBucks], [[]], accounts)
  })

  it('should mint, increasing totalSupply and recipient balance', async function () {
    await bearBucks.mint(accounts[0], amount, {from: accounts[5]})

    var stateChanges = [
      {'var': 'totalSupply', 'expect': amount},
      {'var': 'balanceOf.a0', 'expect': amount}
    ]
    await checkState([bearBucks], [stateChanges], accounts)
  })

  it('should burn, decreasing totalSupply and recipient balance', async function () {
    await bearBucks.mint(accounts[0], amount, {from: accounts[5]})
    await bearBucks.burn(accounts[0], amount, {from: accounts[5]})

    await checkState([bearBucks], [[]], accounts)
  })

  it('should transfer, decreasing sender balance and increasing recipient balance', async function () {
    await bearBucks.mint(accounts[0], amount, {from: accounts[5]})
    await bearBucks.transfer(accounts[1], amount, {from: accounts[0]})

    var stateChanges = [
      {'var': 'totalSupply', 'expect': amount},
      {'var': 'balanceOf.a1', 'expect': amount}
    ]
    await checkState([bearBucks], [stateChanges], accounts)
  })

  it('should approve, increasing spender allowance', async function () {
    await bearBucks.mint(accounts[0], amount, {from: accounts[5]})
    await bearBucks.approve(accounts[1], amount, {from: accounts[0]})

    var stateChanges = [
      {'var': 'totalSupply', 'expect': amount},
      {'var': 'balanceOf.a0', 'expect': amount},
      {'var': 'allowance.a0.a1', 'expect': amount}
    ]
    await checkState([bearBucks], [stateChanges], accounts)
  })

  it('should transferFrom, reducing spender allowance and transfering from sender to recipient', async function () {
    await bearBucks.mint(accounts[0], amount, {from: accounts[5]})
    await bearBucks.approve(accounts[1], amount, {from: accounts[0]})
    await bearBucks.transferFrom(accounts[0], accounts[2], amount, {from: accounts[1]})

    var stateChanges = [
      {'var': 'totalSupply', 'expect': amount},
      {'var': 'balanceOf.a2', 'expect': amount}
    ]
    await checkState([bearBucks], [stateChanges], accounts)
  })

})
