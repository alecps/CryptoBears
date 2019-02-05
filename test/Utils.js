const CryptoBears = artifacts.require('CryptoBears')
const BearBucks = artifacts.require('BearBucks')
const BearCrowdsale = artifacts.require('BearCrowdsale')
const ReentrancyExploit = artifacts.require('ReentrancyExploit')

const assertDiff = require('assert-diff')
assertDiff.options.strict = true
const BigNumber = require('bignumber.js')
const _ = require('lodash')
const mapValuesDeep = (v, callback) => (
  _.isObject(v)
    ? _.mapValues(v, v => mapValuesDeep(v, callback))
    : callback(v)
)
const zero = "0x0000000000000000000000000000000000000000"

var accountBalances = {}

// Checks whether an event was properly emmitted.
async function checkEvent(type, event, params) {
  let eventFound = false
  event.logs.forEach((o) => {
    if (o.event === type) {
      eventFound = true
      assertDiff.deepEqual(Object.values(o.args), params)
    }
  })
  if (!eventFound) {
    throw new Error('The specified event was not emmitted: ' + type)
  }
}

// Checks for differences between expected and actual states of contract.
async function checkState(_tokens, _stateChanges, _accounts) {
  var numTokens = _tokens.length
  assert.equal(numTokens, _stateChanges.length)
  for (var i = 0; i < numTokens; i++) {
    var token = _tokens[i]
    var stateChanges = _stateChanges[i]
    var name = await token.contractName.call()
    var _expectedState = await expectedState(token, stateChanges, _accounts, name)
    var _actualState = await actualState(token, _expectedState, _accounts, name)
    assertDiff.deepEqual(_actualState, _expectedState,
      "difference between expected and actual state")
    if (name != 'BearCrowdsale') {
      await checkBalancesSumToTotalSupply(token, _accounts, name)
    }
  }
}

// Builds expected state of contract using custom variables specified in test.
async function expectedState(token, stateChanges, accounts, name) {
  switch (name) {
    case 'BearBucks':
    var state = {
      'totalSupply': 0,
      'balanceOf': {
        'a0': 0, 'a1': 0, 'a2': 0, 'a3': 0, 'a4': 0, 'a5': 0, 'a6': 0, 'a7': 0
      },
      'allowance': {
        'a0': {
          'a0': 0, 'a1': 0, 'a2': 0, 'a3': 0, 'a4': 0, 'cb': 0},
        'a1': {'a0': 0, 'a1': 0, 'a2': 0, 'a3': 0, 'a4': 0, 'cb': 0},
        'a2': {'a0': 0, 'a1': 0, 'a2': 0, 'a3': 0, 'a4': 0, 'cb': 0},
        'a3': {'a0': 0, 'a1': 0, 'a2': 0, 'a3': 0, 'a4': 0, 'cb': 0},
        'a4': {'a0': 0, 'a1': 0, 'a2': 0, 'a3': 0, 'a4': 0, 'cb': 0},
      },
      'betSum': {'a0': 0, 'a1': 0, 'a2': 0, 'a3': 0, 'a4': 0},
      'minter': zero
    }
    break
    case 'CryptoBears':
    var state = {
      'balanceOf': {
        'a0': 0, 'a1': 0, 'a2': 0, 'a3': 0, 'a4': 0, 'a5': 0, 'a6': 0, 'a7': 0
      },
      'ownerOf': {'b0': zero, 'b1': zero, 'b2': zero, 'b3': zero, 'b4': zero},
      'getApproved': {'b0': zero, 'b1': zero, 'b2': zero, 'b3': zero, 'b4': zero},
      'isApprovedForAll': {
        'a0': {'a0': false, 'a1': false, 'a2': false, 'a3': false, 'a4': false},
        'a1': {'a0': false, 'a1': false, 'a2': false, 'a3': false, 'a4': false},
        'a2': {'a0': false, 'a1': false, 'a2': false, 'a3': false, 'a4': false},
        'a3': {'a0': false, 'a1': false, 'a2': false, 'a3': false, 'a4': false},
        'a4': {'a0': false, 'a1': false, 'a2': false, 'a3': false, 'a4': false},
      },
      'bets': {
        'b0': {'b0': 0, 'b1': 0, 'b2': 0, 'b3': 0, 'b4': 0},
        'b1': {'b0': 0, 'b1': 0, 'b2': 0, 'b3': 0, 'b4': 0},
        'b2': {'b0': 0, 'b1': 0, 'b2': 0, 'b3': 0, 'b4': 0},
        'b3': {'b0': 0, 'b1': 0, 'b2': 0, 'b3': 0, 'b4': 0},
        'b4': {'b0': 0, 'b1': 0, 'b2': 0, 'b3': 0, 'b4': 0},
      },
      'timeLastFed': {
        'b0': await getTimeOfBirthOrZero(token, 0),
        'b1': await getTimeOfBirthOrZero(token, 1),
        'b2': await getTimeOfBirthOrZero(token, 2),
        'b3': await getTimeOfBirthOrZero(token, 3),
        'b4': await getTimeOfBirthOrZero(token, 4),
      },
      'minter': await token._referee.call(),
    }
    break
    case 'BearCrowdsale':
    var state = {
      'weiRaised': 0,
      'wei_balance': accountBalances,
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

// Gets actual state of contract.
async function actualState(token, state, accounts, name) {
  switch (name) {
    case 'BearBucks':
    var cbAddress = await token._CryptoBearsContract.call()
    var values = [
      /**
       * We use .call() when just trying to read a value without modifying
       * contract state.
       */
      (await token.totalSupply.call()).toNumber(),
      (await token.balanceOf.call(accounts[0])).toNumber(),
      (await token.balanceOf.call(accounts[1])).toNumber(),
      (await token.balanceOf.call(accounts[2])).toNumber(),
      (await token.balanceOf.call(accounts[3])).toNumber(),
      (await token.balanceOf.call(accounts[4])).toNumber(),
      (await token.balanceOf.call(accounts[5])).toNumber(),
      (await token.balanceOf.call(accounts[6])).toNumber(),
      (await token.balanceOf.call(accounts[7])).toNumber(),
      (await token.allowance.call(accounts[0], accounts[0])).toNumber(),
      (await token.allowance.call(accounts[0], accounts[1])).toNumber(),
      (await token.allowance.call(accounts[0], accounts[2])).toNumber(),
      (await token.allowance.call(accounts[0], accounts[3])).toNumber(),
      (await token.allowance.call(accounts[0], accounts[4])).toNumber(),
      (await token.allowance.call(accounts[0], cbAddress)).toNumber(),
      (await token.allowance.call(accounts[1], accounts[0])).toNumber(),
      (await token.allowance.call(accounts[1], accounts[1])).toNumber(),
      (await token.allowance.call(accounts[1], accounts[2])).toNumber(),
      (await token.allowance.call(accounts[1], accounts[3])).toNumber(),
      (await token.allowance.call(accounts[1], accounts[4])).toNumber(),
      (await token.allowance.call(accounts[1], cbAddress)).toNumber(),
      (await token.allowance.call(accounts[2], accounts[0])).toNumber(),
      (await token.allowance.call(accounts[2], accounts[1])).toNumber(),
      (await token.allowance.call(accounts[2], accounts[2])).toNumber(),
      (await token.allowance.call(accounts[2], accounts[3])).toNumber(),
      (await token.allowance.call(accounts[2], accounts[4])).toNumber(),
      (await token.allowance.call(accounts[2], cbAddress)).toNumber(),
      (await token.allowance.call(accounts[3], accounts[0])).toNumber(),
      (await token.allowance.call(accounts[3], accounts[1])).toNumber(),
      (await token.allowance.call(accounts[3], accounts[2])).toNumber(),
      (await token.allowance.call(accounts[3], accounts[3])).toNumber(),
      (await token.allowance.call(accounts[3], accounts[4])).toNumber(),
      (await token.allowance.call(accounts[3], cbAddress)).toNumber(),
      (await token.allowance.call(accounts[4], accounts[0])).toNumber(),
      (await token.allowance.call(accounts[4], accounts[1])).toNumber(),
      (await token.allowance.call(accounts[4], accounts[2])).toNumber(),
      (await token.allowance.call(accounts[4], accounts[3])).toNumber(),
      (await token.allowance.call(accounts[4], accounts[4])).toNumber(),
      (await token.allowance.call(accounts[4], cbAddress)).toNumber(),
      (await token.betSum.call(accounts[0])).toNumber(),
      (await token.betSum.call(accounts[1])).toNumber(),
      (await token.betSum.call(accounts[2])).toNumber(),
      (await token.betSum.call(accounts[3])).toNumber(),
      (await token.betSum.call(accounts[4])).toNumber(),
      await token._minter.call(),
    ]
    break
    case 'CryptoBears':
    var values = [
      (await token.balanceOf.call(accounts[0])).toNumber(),
      (await token.balanceOf.call(accounts[1])).toNumber(),
      (await token.balanceOf.call(accounts[2])).toNumber(),
      (await token.balanceOf.call(accounts[3])).toNumber(),
      (await token.balanceOf.call(accounts[4])).toNumber(),
      (await token.balanceOf.call(accounts[5])).toNumber(),
      (await token.balanceOf.call(accounts[6])).toNumber(),
      (await token.balanceOf.call(accounts[7])).toNumber(),
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
      await token.isApprovedForAll.call(accounts[0], accounts[0]),
      await token.isApprovedForAll.call(accounts[0], accounts[1]),
      await token.isApprovedForAll.call(accounts[0], accounts[2]),
      await token.isApprovedForAll.call(accounts[0], accounts[3]),
      await token.isApprovedForAll.call(accounts[0], accounts[4]),
      await token.isApprovedForAll.call(accounts[1], accounts[0]),
      await token.isApprovedForAll.call(accounts[1], accounts[1]),
      await token.isApprovedForAll.call(accounts[1], accounts[2]),
      await token.isApprovedForAll.call(accounts[1], accounts[3]),
      await token.isApprovedForAll.call(accounts[1], accounts[4]),
      await token.isApprovedForAll.call(accounts[2], accounts[0]),
      await token.isApprovedForAll.call(accounts[2], accounts[1]),
      await token.isApprovedForAll.call(accounts[2], accounts[2]),
      await token.isApprovedForAll.call(accounts[2], accounts[3]),
      await token.isApprovedForAll.call(accounts[2], accounts[4]),
      await token.isApprovedForAll.call(accounts[3], accounts[0]),
      await token.isApprovedForAll.call(accounts[3], accounts[1]),
      await token.isApprovedForAll.call(accounts[3], accounts[2]),
      await token.isApprovedForAll.call(accounts[3], accounts[3]),
      await token.isApprovedForAll.call(accounts[3], accounts[4]),
      await token.isApprovedForAll.call(accounts[4], accounts[0]),
      await token.isApprovedForAll.call(accounts[4], accounts[1]),
      await token.isApprovedForAll.call(accounts[4], accounts[2]),
      await token.isApprovedForAll.call(accounts[4], accounts[3]),
      await token.isApprovedForAll.call(accounts[4], accounts[4]),
      (await token.getBet.call(0, 0)).toNumber(),
      (await token.getBet.call(0, 1)).toNumber(),
      (await token.getBet.call(0, 2)).toNumber(),
      (await token.getBet.call(0, 3)).toNumber(),
      (await token.getBet.call(0, 4)).toNumber(),
      (await token.getBet.call(1, 0)).toNumber(),
      (await token.getBet.call(1, 1)).toNumber(),
      (await token.getBet.call(1, 2)).toNumber(),
      (await token.getBet.call(1, 3)).toNumber(),
      (await token.getBet.call(1, 4)).toNumber(),
      (await token.getBet.call(2, 0)).toNumber(),
      (await token.getBet.call(2, 1)).toNumber(),
      (await token.getBet.call(2, 2)).toNumber(),
      (await token.getBet.call(2, 3)).toNumber(),
      (await token.getBet.call(2, 4)).toNumber(),
      (await token.getBet.call(3, 0)).toNumber(),
      (await token.getBet.call(3, 1)).toNumber(),
      (await token.getBet.call(3, 2)).toNumber(),
      (await token.getBet.call(3, 3)).toNumber(),
      (await token.getBet.call(3, 4)).toNumber(),
      (await token.getBet.call(4, 0)).toNumber(),
      (await token.getBet.call(4, 1)).toNumber(),
      (await token.getBet.call(4, 2)).toNumber(),
      (await token.getBet.call(4, 3)).toNumber(),
      (await token.getBet.call(4, 4)).toNumber(),
      await getTimeLastFedOrZero(token, 0),
      await getTimeLastFedOrZero(token, 1),
      await getTimeLastFedOrZero(token, 2),
      await getTimeLastFedOrZero(token, 3),
      await getTimeLastFedOrZero(token, 4),
      await token._minter.call(),
    ]
    break
    case 'BearCrowdsale':
    var values = [
      (await token._weiRaised.call()).toNumber(),
      (await web3.eth.getBalance(accounts[0])).toNumber(),
      (await web3.eth.getBalance(accounts[1])).toNumber(),
      (await web3.eth.getBalance(accounts[2])).toNumber(),
      (await web3.eth.getBalance(accounts[3])).toNumber(),
      (await web3.eth.getBalance(accounts[4])).toNumber(),
      (await web3.eth.getBalance(accounts[5])).toNumber(),
      (await web3.eth.getBalance(accounts[6])).toNumber(),
      (await web3.eth.getBalance(accounts[7])).toNumber(),
      (await web3.eth.getBalance(accounts[8])).toNumber(),
      (await web3.eth.getBalance(accounts[9])).toNumber(),
    ]
    break
    default:
    throw new Error('Contract name not recognized ' + name)
  }
  return mapValuesDeep(state, () => values.shift())
}

async function getTimeLastFedOrZero(cryptoBears, bearID) {
  try{
    var res = (await cryptoBears.getTimeLastFed.call(bearID)).toNumber()
    return (res)
  } catch (e) {return 0}
}

async function getTimeOfBirthOrZero(cryptoBears, bearID) {
  try{
    var res = (await cryptoBears.getTimeOfBirth.call(bearID)).toNumber()
    return res
  } catch (e) {return 0}
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
    var totalSupply = (await token.getNumBears.call()).toNumber()
    break
    default:
    throw new Error('Contract name not recognized ' + name)
  }
  assertDiff.equal(balanceSum, totalSupply,
    'total supply does not equal sum of balances for ' + name)
}

// Used for negative tests.
async function expectRevert(contractPromise) {
  try {
    await contractPromise;
  } catch (error) {
    assert(
      error.message.search('revert') >= 0,
      'Expected error of type revert, got \'' + error + '\' instead',
    );
    return;
  }
  assert.fail('Expected error of type revert, but no error was received');
}

function getExpectedBalanceDelta(gas_used, wei_used) {
  return gas_used.times(new BigNumber(100000000000)).plus((new BigNumber(wei_used)))
}

// Waits the specified number of ms before continuing test execution.
function pause(ms) { return new Promise(resolve => { setTimeout(resolve, ms)}) }

async function updateBalances(accounts) {
  for (var i = 0; i < accounts.length; i++) {
    let key = 'a' + i.toString()
    let val = (await web3.eth.getBalance(accounts[i])).toNumber()
    accountBalances[key] = val
  }
}

async function getGasUsed() {
  return (await web3.eth.getBlock('latest')).gasUsed * 100000000000
}


module.exports = {
  CryptoBears: CryptoBears,
  BearBucks: BearBucks,
  BearCrowdsale: BearCrowdsale,
  checkState: checkState,
  expectRevert: expectRevert,
  zero: zero,
  pause: pause,
  checkEvent: checkEvent,
  getExpectedBalanceDelta: getExpectedBalanceDelta,
  ReentrancyExploit: ReentrancyExploit,
  updateBalances: updateBalances,
  getGasUsed: getGasUsed,
}
