var utils = require('./Utils')

var CryptoBears = utils.CryptoBears
var BearBucks = utils.BearBucks
var checkState = utils.checkState

var amount = 100;
var genes = 0;
var name = 'Bruno'


contract('CryptoBearsNegativeTests', async function (accounts) {

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
