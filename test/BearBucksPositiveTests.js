const utils = require('./Utils')

const CryptoBears = utils.CryptoBears
const BearBucks = utils.BearBucks
const checkState = utils.checkState

const amount = 100

contract('BearBucksPositiveTests', async function (accounts) {

  beforeEach('Make fresh contract', async function () {
    // We let accounts[5] represent the CryptoBearsContract.
    bearBucks = await BearBucks.new({from: accounts[5]})
  })

  it('should have correct initial state', async function () {
    await checkState([bearBucks], [[]], accounts)
  })

  it('should return betSum without changing state', async function () {
    assert.equal((await bearBucks.betSum(accounts[0])).toNumber(), 0) // We have to use .toNumber() because uint256's are returned as BigNumbers.
    await checkState([bearBucks], [[]], accounts)
  })

  it('should placeBet in BearBucks contract', async function () {
    await bearBucks.mint(accounts[0], amount, {from: accounts[5]})
    await bearBucks.approve(accounts[5], amount, {from: accounts[0]})
    await bearBucks.placeBet(accounts[0], amount, {from: accounts[5]})

    let stateChanges = [
      {'var': 'totalSupply', 'expect': amount},
      {'var': 'balanceOf.a0', 'expect': amount},
      {'var': 'allowance.a0.cb', 'expect': amount},
      {'var': 'betSum.a0', 'expect': amount}
    ]
    await checkState([bearBucks], [stateChanges], accounts)
  })

  it('should removeBet in BearBucks contract', async function () {
    await bearBucks.mint(accounts[0], amount, {from: accounts[5]})
    await bearBucks.approve(accounts[5], amount, {from: accounts[0]})
    await bearBucks.placeBet(accounts[0], amount, {from: accounts[5]})
    await bearBucks.removeBet(accounts[0], amount, {from: accounts[5]})

    let stateChanges = [
      {'var': 'totalSupply', 'expect': amount},
      {'var': 'balanceOf.a0', 'expect': amount},
      {'var': 'allowance.a0.cb', 'expect': amount}
    ]
    await checkState([bearBucks], [stateChanges], accounts)
  })

})
