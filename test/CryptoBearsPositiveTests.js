var utils = require('./Utils')

var CryptoBears = utils.CryptoBears
var BearBucks = utils.BearBucks
var checkState = utils.checkState

var amount = 100;
var genes = 0;
var name = 'Bruno'


contract('CryptoBearsPositiveTests', async function (accounts) {

  beforeEach('Make fresh contract', async function () {
    cryptoBears = await CryptoBears.new()
  })

  it('should have correct initial state', async function () {
    await checkState([cryptoBears], [[]], accounts)
  })

  it('should ...', async function () {

    var stateChanges = [
      {'var': '', 'expect': }
    ]
    await checkState([cryptoBears], [stateChanges], accounts)
  })

  it('should ...', async function () {

    var stateChanges = [
      {'var': '', 'expect': }
    ]
    await checkState([cryptoBears], [stateChanges], accounts)
  })

  it('should ...', async function () {

    var stateChanges = [
      {'var': '', 'expect': }
    ]
    await checkState([cryptoBears], [stateChanges], accounts)
  })

  it('should ...', async function () {

    var stateChanges = [
      {'var': '', 'expect': }
    ]
    await checkState([cryptoBears], [stateChanges], accounts)
  })

  it('should ...', async function () {

    var stateChanges = [
      {'var': '', 'expect': }
    ]
    await checkState([cryptoBears], [stateChanges], accounts)
  })

  it('should create newBear, minting BearBucks to its owner', async function () {
    //TODO
    var bearID = await cryptoBears.newBear(genes, accounts[1], name)
    assert.equal(await cryptoBears.ownerOf(bearID), accounts[1])
    var cryptoBearsStateChanges = [
      {'var': 'ownerOf(accounts[1])', 'expect': }
    ]
    var bearBucksStateChanges = [
      {'var': '', 'expect': }
    ]
    await checkState([cryptoBears], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  })

  it('should ...', async function () {

    var stateChanges = [
      {'var': '', 'expect': }
    ]
    await checkState([cryptoBears], [stateChanges], accounts)
  })

  it('should ...', async function () {

    var stateChanges = [
      {'var': '', 'expect': }
    ]
    await checkState([cryptoBears], [stateChanges], accounts)
  })

  it('should ...', async function () {

    var stateChanges = [
      {'var': '', 'expect': }
    ]
    await checkState([cryptoBears], [stateChanges, accounts)
  })

  it('should ...', async function () {\

    var stateChanges = [
      {'var': '', 'expect': }
    ]
    await checkState([cryptoBears], [stateChanges], accounts)
  })

  it('should ...', async function () {

    var stateChanges = [
      {'var': '', 'expect': }
    ]
    await checkState([cryptoBears], [stateChanges], accounts)
  })

  it('should ...', async function () {

    var stateChanges = [
      {'var': '', 'expect': }
    ]
    await checkState([cryptoBears], [stateChanges], accounts)
  })

  it('should ...', async function () {

    var stateChanges = [
      {'var': '', 'expect': }
    ]
    await checkState([cryptoBears], [stateChanges], accounts)
  })

})
