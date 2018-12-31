const utils = require('./Utils')

const CryptoBears = utils.CryptoBears
const BearBucks = utils.BearBucks
const checkState = utils.checkState
const expectRevert = utils.expectRevert

const amount = 100;
const genes = 0;
const name = 'Bruno'


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
