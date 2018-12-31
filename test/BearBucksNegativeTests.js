var utils = require('./Utils')

var CryptoBears = utils.CryptoBears
var BearBucks = utils.BearBucks
var checkState = utils.checkState

var amount = 100

contract('BearBucksNegativeTests', async function (accounts) {

  beforeEach('Make fresh contract', async function () {
    // We let accounts[0] represent the CryptoBearsContract.
    bearBucks = await BearBucks.new({from: accounts[0]})
  })

  it('should have correct initial state', async function () {
    await checkState([bearBucks], [[]], accounts)
  })

  it('should ...', async function () {

    var stateChanges = [
      {'var': '', 'expect': }
    ]
    await checkState([bearBucks], [stateChanges], accounts)
  })

  it('should ...', async function () {

    var stateChanges = [
      {'var': '', 'expect': }
    ]
    await checkState([bearBucks], [stateChanges], accounts)
  })

  it('should ...', async function () {

    var stateChanges = [
      {'var': '', 'expect': }
    ]
    await checkState([bearBucks], [stateChanges], accounts)
  })

  it('should ...', async function () {

    var stateChanges = [
      {'var': '', 'expect': }
    ]
    await checkState([bearBucks], [stateChanges], accounts)
  })

  it('should ...', async function () {

    var stateChanges = [
      {'var': '', 'expect': }
    ]
    await checkState([bearBucks], [stateChanges], accounts)
  })

  it('should ...', async function () {

    var stateChanges = [
      {'var': '', 'expect': }
    ]
    await checkState([bearBucks], [stateChanges], accounts)
  })

  it('should ...', async function () {

    var stateChanges = [
      {'var': '', 'expect': }
    ]
    await checkState([bearBucks], [stateChanges], accounts)
  })

  it('should ...', async function () {

    var stateChanges = [
      {'var': '', 'expect': }
    ]
    await checkState([bearBucks], [stateChanges], accounts)
  })

})
