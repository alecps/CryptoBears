var CryptoBears = artifacts.require('CryptoBears')
var BearBucks = artifacts.require('BearBucks')

var assertDiff = require('assert-diff');


async function checkState(_tokens, _stateChanges) {
  var numTokens = _tokens.length
  assert.equal(numTokens, _stateChanges.length)
  for (var i = 0; i < numTokens; i++) {
    var token = _tokens[i]
    var stateChanges = _stateChanges[i]
    let expectedState = expectedState(token, stateChanges)
    let actualState = await getActualState(token)
    assertDiff.deepEqual(actualState, expectedState, "difference between expected and actual state")
    // // Check that sum of individual balances equals totalSupply
    // var accounts = [arbitraryAccount, masterMinterAccount, minterAccount, pauserAccount, blacklisterAccount, tokenOwnerAccount, upgraderAccount]
    // var balanceSum = bigZero
    // var x
    // for (x = 0; x < accounts.length; x++) {
    //     balanceSum = balanceSum.plus(new BigNumber(await token.balanceOf(accounts[x])))
    // }
    // var totalSupply = new BigNumber(await token.totalSupply())
    // assert(balanceSum.isEqualTo(totalSupply))
  }
}

function expectedState(token) {

}

async function actualState(token) {

}


module.exports = {
  CryptoBears: CryptoBears,
  BearBucks: BearBucks,
  checkState: checkState,

}
