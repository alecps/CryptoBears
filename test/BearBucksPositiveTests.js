const utils = require('./Utils')

const CryptoBears = utils.CryptoBears
const BearBucks = utils.BearBucks
const checkState = utils.checkState

const amount = 100;

contract('BearBucksPositiveTests', async function (accounts) {

  beforeEach('Make fresh contract', async function () {
    // We let accounts[0] represent the CryptoBearsContract.
    bearBucks = await BearBucks.new({from: accounts[0]})
  })

  it('should have correct initial state', async function () {
    await checkState([bearBucks], [[]], accounts)
  })

  it('should return betSum without changing state', async function () {
    assert.equal((await bearBucks.betSum(accounts[0])).toNumber(), 0)
    await checkState([bearBucks], [[]], accounts)
  })

  /* NOTE: This test gives away part of the solution. Have students fill in? */
  it('should placeBet in BearBucks contract', async function () {
    await bearBucks.mint(accounts[1], amount, {from: accounts[0]})
    await bearBucks.approve(accounts[0], amount, {from: accounts[1]})
    await bearBucks.placeBet(accounts[1], amount, {from: accounts[0]})

    var stateChanges = [
      {'var': 'totalSupply', 'expect': amount},
      {'var': 'balanceOf.a1', 'expect': amount},
      {'var': 'allowance.a1.a0', 'expect': amount},
      {'var': 'betSum.a1', 'expect': amount}
    ]
    await checkState([bearBucks], [stateChanges], accounts)
  })

  /* NOTE: This test gives away part of the solution. Have students fill in? */
  it('should removeBet in BearBucks contract', async function () {
    await bearBucks.mint(accounts[1], amount, {from: accounts[0]})
    await bearBucks.approve(accounts[0], amount, {from: accounts[1]})
    await bearBucks.placeBet(accounts[1], amount, {from: accounts[0]})
    await bearBucks.removeBet(accounts[1], amount, {from: accounts[0]})

    var stateChanges = [
      {'var': 'totalSupply', 'expect': amount},
      {'var': 'balanceOf.a1', 'expect': amount},
      {'var': 'allowance.a1.a0', 'expect': amount}
    ]
    await checkState([bearBucks], [stateChanges], accounts)
  })

})
