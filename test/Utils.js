const CryptoBears = artifacts.require('CryptoBears')
const BearBucks = artifacts.require('BearBucks')

const assertDiff = require('assert-diff')
assertDiff.options.strict = true
const BigNumber = require('bignumber.js')
const _ = require('lodash')
const mapValuesDeep = (v, callback) => (
  _.isObject(v)
    ? _.mapValues(v, v => mapValuesDeep(v, callback))
    : callback(v)
)

async function checkState(_tokens, _stateChanges, _accounts) {
  var numTokens = _tokens.length
  assert.equal(numTokens, _stateChanges.length)
  for (var i = 0; i < numTokens; i++) {
    var token = _tokens[i]
    var stateChanges = _stateChanges[i]
    var name = await token.contractName.call()
    var _expectedState = await expectedState(token, stateChanges, _accounts, name)
    var _actualState = await actualState(token, _expectedState, _accounts, name)
    assertDiff.deepEqual(_actualState, _expectedState, "difference between expected and actual state")
    await checkBalancesSumToTotalSupply(token, _accounts, name)
  }
}

async function expectedState(token, stateChanges, accounts, name) {
  var name = await token.contractName.call()
  switch (name) {
    case 'BearBucks':
    var state = {
      'totalSupply': 0,
      'balanceOf': {'a0': 0, 'a1': 0, 'a2': 0, 'a3': 0, 'a4': 0},
      'allowance': {
        'a0': {'a1': 0, 'a2': 0, 'a3': 0, 'a4': 0},
        'a1': {'a0': 0, 'a2': 0, 'a3': 0, 'a4': 0},
        'a2': {'a0': 0, 'a1': 0, 'a3': 0, 'a4': 0},
        'a3': {'a0': 0, 'a1': 0, 'a2': 0, 'a4': 0},
        'a4': {'a0': 0, 'a1': 0, 'a2': 0, 'a3': 0},
      },
      'betSum': {'a0': 0, 'a1': 0, 'a2': 0, 'a3': 0, 'a4': 0},
    }
    break
    case 'CryptoBears':
    var state = {
      'balanceOf': {'a0': 0, 'a1': 0, 'a2': 0, 'a3': 0, 'a4': 0},
      'ownerOf': {'b0': '0x0', 'b1': '0x0', 'b2': '0x0', 'b3': '0x0', 'b4': '0x0'},
      'getApproved': {'b0': '0x0', 'b1': '0x0', 'b2': '0x0', 'b3': '0x0', 'b4': '0x0'},
      'isApprovedForAll': {
        'a0': {'a1': false, 'a2': false, 'a3': false, 'a4': false},
        'a1': {'a0': false, 'a2': false, 'a3': false, 'a4': false},
        'a2': {'a0': false, 'a1': false, 'a3': false, 'a4': false},
        'a3': {'a0': false, 'a1': false, 'a2': false, 'a4': false},
        'a4': {'a0': false, 'a1': false, 'a2': false, 'a3': false},
      },
      'bets': {
        't0': {'t1': 0, 't2': 0, 't3': 0, 't4': 0},
        't1': {'t0': 0, 't2': 0, 't3': 0, 't4': 0},
        't2': {'t0': 0, 't1': 0, 't3': 0, 't4': 0},
        't3': {'t0': 0, 't1': 0, 't2': 0, 't4': 0},
        't4': {'t0': 0, 't1': 0, 't2': 0, 't3': 0},
      },
    }
    break
    default:
    throw new Error('Contract name not recognized ' + name)
  }

  for (var i = 0; i < stateChanges.length; ++i) {
    var variable = stateChanges[i].var
    if (_.has(state, variable)) {
      var defaultVal = state[variable]
      var change = stateChanges[i].expect
      if (defaultVal == change) {
        throw new Error("Default value specified for variable " + variable)
      } else {
        _.set(state, variable, change)
      }
    } else {
      throw new Error("variable " + variable + " not found in state")
    }
  }

  return state
}

async function actualState(token, state, accounts, name) {
  switch (name) {
    case 'BearBucks':
    var values = [
      (await token.totalSupply.call()).toNumber(),
      (await token.balanceOf.call(accounts[0])).toNumber(),
      (await token.balanceOf.call(accounts[1])).toNumber(),
      (await token.balanceOf.call(accounts[2])).toNumber(),
      (await token.balanceOf.call(accounts[3])).toNumber(),
      (await token.balanceOf.call(accounts[4])).toNumber(),
      (await token.allowance.call(accounts[0], accounts[1])).toNumber(),
      (await token.allowance.call(accounts[0], accounts[2])).toNumber(),
      (await token.allowance.call(accounts[0], accounts[3])).toNumber(),
      (await token.allowance.call(accounts[0], accounts[4])).toNumber(),
      (await token.allowance.call(accounts[1], accounts[0])).toNumber(),
      (await token.allowance.call(accounts[1], accounts[2])).toNumber(),
      (await token.allowance.call(accounts[1], accounts[3])).toNumber(),
      (await token.allowance.call(accounts[1], accounts[4])).toNumber(),
      (await token.allowance.call(accounts[2], accounts[0])).toNumber(),
      (await token.allowance.call(accounts[2], accounts[1])).toNumber(),
      (await token.allowance.call(accounts[2], accounts[3])).toNumber(),
      (await token.allowance.call(accounts[2], accounts[4])).toNumber(),
      (await token.allowance.call(accounts[3], accounts[0])).toNumber(),
      (await token.allowance.call(accounts[3], accounts[1])).toNumber(),
      (await token.allowance.call(accounts[3], accounts[2])).toNumber(),
      (await token.allowance.call(accounts[3], accounts[4])).toNumber(),
      (await token.allowance.call(accounts[4], accounts[0])).toNumber(),
      (await token.allowance.call(accounts[4], accounts[1])).toNumber(),
      (await token.allowance.call(accounts[4], accounts[2])).toNumber(),
      (await token.allowance.call(accounts[4], accounts[3])).toNumber(),
      (await token.betSum.call(accounts[0])).toNumber(),
      (await token.betSum.call(accounts[1])).toNumber(),
      (await token.betSum.call(accounts[2])).toNumber(),
      (await token.betSum.call(accounts[3])).toNumber(),
      (await token.betSum.call(accounts[4])).toNumber(),
    ]
    break
    case 'CryptoBears':
    var values = [
      (await token.balanceOf.call(accounts[0])).toNumber(),
      (await token.balanceOf.call(accounts[1])).toNumber(),
      (await token.balanceOf.call(accounts[2])).toNumber(),
      (await token.balanceOf.call(accounts[3])).toNumber(),
      (await token.balanceOf.call(accounts[4])).toNumber(),
      await token.ownerOf.call(0),
      await token.ownerOf.call(1),
      await token.ownerOf.call(2),
      await token.ownerOf.call(3),
      await token.ownerOf.call(4),
      await token.getApproved.call(0),
      await token.getApproved.call(1),
      await token.getApproved.call(2),
      await token.getApproved.call(3),
      await token.getApproved.call(4),
      await token.isApprovedForAll.call(accounts[0], accounts[1]),
      await token.isApprovedForAll.call(accounts[0], accounts[2]),
      await token.isApprovedForAll.call(accounts[0], accounts[3]),
      await token.isApprovedForAll.call(accounts[0], accounts[4]),
      await token.isApprovedForAll.call(accounts[1], accounts[0]),
      await token.isApprovedForAll.call(accounts[1], accounts[2]),
      await token.isApprovedForAll.call(accounts[1], accounts[3]),
      await token.isApprovedForAll.call(accounts[1], accounts[4]),
      await token.isApprovedForAll.call(accounts[2], accounts[0]),
      await token.isApprovedForAll.call(accounts[2], accounts[1]),
      await token.isApprovedForAll.call(accounts[2], accounts[3]),
      await token.isApprovedForAll.call(accounts[2], accounts[4]),
      await token.isApprovedForAll.call(accounts[3], accounts[0]),
      await token.isApprovedForAll.call(accounts[3], accounts[1]),
      await token.isApprovedForAll.call(accounts[3], accounts[2]),
      await token.isApprovedForAll.call(accounts[3], accounts[4]),
      await token.isApprovedForAll.call(accounts[4], accounts[0]),
      await token.isApprovedForAll.call(accounts[4], accounts[1]),
      await token.isApprovedForAll.call(accounts[4], accounts[2]),
      await token.isApprovedForAll.call(accounts[4], accounts[3]),
      (await token.getBet.call(0, 1)).toNumber(),
      (await token.getBet.call(0, 2)).toNumber(),
      (await token.getBet.call(0, 3)).toNumber(),
      (await token.getBet.call(0, 4)).toNumber(),
      (await token.getBet.call(1, 0)).toNumber(),
      (await token.getBet.call(1, 2)).toNumber(),
      (await token.getBet.call(1, 3)).toNumber(),
      (await token.getBet.call(1, 4)).toNumber(),
      (await token.getBet.call(2, 0)).toNumber(),
      (await token.getBet.call(2, 1)).toNumber(),
      (await token.getBet.call(2, 3)).toNumber(),
      (await token.getBet.call(2, 4)).toNumber(),
      (await token.getBet.call(3, 0)).toNumber(),
      (await token.getBet.call(3, 1)).toNumber(),
      (await token.getBet.call(3, 2)).toNumber(),
      (await token.getBet.call(3, 4)).toNumber(),
      (await token.getBet.call(4, 0)).toNumber(),
      (await token.getBet.call(4, 1)).toNumber(),
      (await token.getBet.call(4, 2)).toNumber(),
      (await token.getBet.call(4, 3)).toNumber(),
    ]
    break
    default:
    throw new Error('Contract name not recognized ' + name)
  }
  return mapValuesDeep(state, () => values.shift())
}

async function checkBalancesSumToTotalSupply(token, accounts, name) {
  var balanceSum = 0;
  for (var i = 0; i < accounts.length; i++) {
    balanceSum += (await token.balanceOf.call(accounts[i])).toNumber()
  }
  switch(name) {
    case 'BearBucks':
    var totalSupply = (await token.totalSupply.call()).toNumber()
    break
    case 'CryptoBears':
    var totalSupply = (await token._bears.call()).toNumber()
    break
    default:
    throw new Error('Contract name not recognized ' + name)
  }
  assertDiff.equal(balanceSum, totalSupply,
    'total supply does not equal sum of balances for ' + name)
}


module.exports = {
  CryptoBears: CryptoBears,
  BearBucks: BearBucks,
  checkState: checkState,
}
