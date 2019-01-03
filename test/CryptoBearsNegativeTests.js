const utils = require('./Utils')
const BigNumber = require('bignumber.js')

const CryptoBears = utils.CryptoBears
const BearBucks = utils.BearBucks
const checkState = utils.checkState
const expectRevert = utils.expectRevert
const zero = utils.zero
const pause = utils.pause

const startBalance = 100
const feedingCost = 20
const feedingInterval = 60
const genes = 0
const name = 'Bruno'


contract('CryptoBearsNegativeTests', async function (accounts) {

  beforeEach('Make fresh contract', async function () {
    cryptoBears = await CryptoBears.new( // We let accounts[5] represent the manager
      startBalance, feedingCost, feedingInterval, accounts[5])
    bearBucks = BearBucks.at(await cryptoBears._BearBucksContract.call())
  })

  it('should have correct initial state', async function () {
    await checkState([cryptoBears, bearBucks], [[], []], accounts)
  })

  it('should fail to get balanceOf address(0)', async function () {
    await expectRevert(cryptoBears.balanceOf('0x0'))
    await checkState([cryptoBears, bearBucks], [[], []], accounts)
  })

  it('should fail to approve owner', async function () {
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})
    await expectRevert(cryptoBears.approve(accounts[0], 0, {from: accounts[0]}))
    var cryptoBearsStateChanges = [
      {'var': 'balanceOf.a0', 'expect': 1},
      {'var': 'ownerOf.b0', 'expect': accounts[0]},
    ]
    var bearBucksStateChanges = [
      {'var': 'totalSupply', 'expect': startBalance},
      {'var': 'balanceOf.a0', 'expect': startBalance}
    ]
    await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  })

  it('should fail to approve if msg.sender is not owner or approvedForAll', async function () {
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})
    await expectRevert(cryptoBears.approve(accounts[1], 0, {from: accounts[2]}))
    var cryptoBearsStateChanges = [
      {'var': 'balanceOf.a0', 'expect': 1},
      {'var': 'ownerOf.b0', 'expect': accounts[0]},
    ]
    var bearBucksStateChanges = [
      {'var': 'totalSupply', 'expect': startBalance},
      {'var': 'balanceOf.a0', 'expect': startBalance}
    ]
    await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  })

  it('should fail to setApprovalForAll for self', async function () {
    await expectRevert(cryptoBears.setApprovalForAll(accounts[0], true, {from: accounts[0]}))
    await checkState([cryptoBears, bearBucks], [[], []], accounts)
  })

  it('should fail to transferFrom if msg.sender is not approved or owner', async function () {
    var bearID = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bearID, 0)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})
    await expectRevert(cryptoBears.transferFrom(accounts[0], accounts[2], bearID, {from: accounts[3]}))

    var cryptoBearsStateChanges = [
      {'var': 'balanceOf.a0', 'expect': 1},
      {'var': 'ownerOf.b0', 'expect': accounts[0]}
    ]
    var bearBucksStateChanges = [
      {'var': 'totalSupply', 'expect': startBalance},
      {'var': 'balanceOf.a0', 'expect': startBalance}
    ]
    await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  })

  it('should fail to transferFrom to address(0)', async function () {
    var bearID = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bearID, 0)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})
    await expectRevert(cryptoBears.transferFrom(accounts[0], '0x0', bearID, {from: accounts[0]}))

    var cryptoBearsStateChanges = [
      {'var': 'balanceOf.a0', 'expect': 1},
      {'var': 'ownerOf.b0', 'expect': accounts[0]}
    ]
    var bearBucksStateChanges = [
      {'var': 'totalSupply', 'expect': startBalance},
      {'var': 'balanceOf.a0', 'expect': startBalance}
    ]
    await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  })

  it('should fail to transferFrom when from is not owner', async function () {
    var bearID = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bearID, 0)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})
    await expectRevert(cryptoBears.transferFrom(accounts[2], accounts[1], bearID, {from: accounts[0]}))

    var cryptoBearsStateChanges = [
      {'var': 'balanceOf.a0', 'expect': 1},
      {'var': 'ownerOf.b0', 'expect': accounts[0]}
    ]
    var bearBucksStateChanges = [
      {'var': 'totalSupply', 'expect': startBalance},
      {'var': 'balanceOf.a0', 'expect': startBalance}
    ]
    await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  })

  it('should fail to create newBear if msg.sender is not manager', async function () {
    await expectRevert(cryptoBears.newBear(genes, accounts[0], name, {from: accounts[6]}))
    await checkState([cryptoBears, bearBucks], [[], []], accounts)
  })

  it('should fail to create newBear for address(0)', async function () {
    await expectRevert(cryptoBears.newBear(genes, '0x0', name, {from: accounts[5]}))
    await checkState([cryptoBears, bearBucks], [[], []], accounts)
  })

  it('should fail to feed if bear does not exist', async function () {
    //TODO: fix this test
    await bearBucks.mint(accounts[0], startBalance)
    await expectRevert(cryptoBears.feed(0, feedingCost, {from: accounts[0]}))
    var bearBucksStateChanges = [
      {'var': 'totalSupply', 'expect': startBalance},
      {'var': 'balanceOf.a0', 'expect': startBalance}
    ]
    await checkState([cryptoBears, bearBucks], [[], bearBucksStateChanges], accounts)
  })

  it('should fail to feed if msg.sender is not owner', async function () {
    //TODO: fix this test
    var bearID = (await cryptoBears.newBear.call(genes, accounts[0], name, {from: accounts[5]})).toNumber()
    assert.equal(bearID, 0)
    await cryptoBears.newBear(genes, accounts[0], name, {from: accounts[5]})
    await bearBucks.mint(accounts[1], startBalance, {from: accounts[0]})
    await expectRevert(cryptoBears.feed(0, feedingCost, {from: accounts[1]}))
    var cryptoBearsStateChanges = [
      {'var': 'balanceOf.a0', 'expect': 1},
      {'var': 'ownerOf.b0', 'expect': accounts[0]},
    ]
    var bearBucksStateChanges = [
      {'var': 'totalSupply', 'expect': 2*startBalance},
      {'var': 'balanceOf.a0', 'expect': startBalance},
      {'var': 'balanceOf.a1', 'expect': startBalance},
    ]
    await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  })

  // it('should fail to feed if BearBucks balance is less than amount', async function () {
  //
  //   var cryptoBearsStateChanges = [
  //     {'var': 'balanceOf.a0', 'expect': 1},
  //     {'var': 'ownerOf.b0', 'expect': accounts[0]}
  //   ]
  //   var bearBucksStateChanges = [
  //     {'var': 'totalSupply', 'expect': startBalance},
  //     {'var': 'balanceOf.a0', 'expect': startBalance}
  //   ]
  //   await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  // })
  //
  // it('should fail to getMealsNeeded if bear does not exist', async function () {
  //
  //   var cryptoBearsStateChanges = [
  //     {'var': 'balanceOf.a0', 'expect': 1},
  //     {'var': 'ownerOf.b0', 'expect': accounts[0]}
  //   ]
  //   var bearBucksStateChanges = [
  //     {'var': 'totalSupply', 'expect': startBalance},
  //     {'var': 'balanceOf.a0', 'expect': startBalance}
  //   ]
  //   await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  // })
  //
  // it('should fail to placeBet if either bear does not exist', async function () {
  //
  //   var cryptoBearsStateChanges = [
  //     {'var': 'balanceOf.a0', 'expect': 1},
  //     {'var': 'ownerOf.b0', 'expect': accounts[0]}
  //   ]
  //   var bearBucksStateChanges = [
  //     {'var': 'totalSupply', 'expect': startBalance},
  //     {'var': 'balanceOf.a0', 'expect': startBalance}
  //   ]
  //   await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  // })
  //
  // it('should fail to placeBet if bear is hungry', async function () {
  //
  //   var cryptoBearsStateChanges = [
  //     {'var': 'balanceOf.a0', 'expect': 1},
  //     {'var': 'ownerOf.b0', 'expect': accounts[0]}
  //   ]
  //   var bearBucksStateChanges = [
  //     {'var': 'totalSupply', 'expect': startBalance},
  //     {'var': 'balanceOf.a0', 'expect': startBalance}
  //   ]
  //   await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  // })
  //
  // it('should fail to placeBet if msg.sender is not owner', async function () {
  //
  //   var cryptoBearsStateChanges = [
  //     {'var': 'balanceOf.a0', 'expect': 1},
  //     {'var': 'ownerOf.b0', 'expect': accounts[0]}
  //   ]
  //   var bearBucksStateChanges = [
  //     {'var': 'totalSupply', 'expect': startBalance},
  //     {'var': 'balanceOf.a0', 'expect': startBalance}
  //   ]
  //   await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  // })
  //
  // it('should fail to placeBet of 0', async function () {
  //
  //   var cryptoBearsStateChanges = [
  //     {'var': 'balanceOf.a0', 'expect': 1},
  //     {'var': 'ownerOf.b0', 'expect': accounts[0]}
  //   ]
  //   var bearBucksStateChanges = [
  //     {'var': 'totalSupply', 'expect': startBalance},
  //     {'var': 'balanceOf.a0', 'expect': startBalance}
  //   ]
  //   await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  // })
  //
  // it('should fail to placeBet with 2nd value', async function () {
  //
  //   var cryptoBearsStateChanges = [
  //     {'var': 'balanceOf.a0', 'expect': 1},
  //     {'var': 'ownerOf.b0', 'expect': accounts[0]}
  //   ]
  //   var bearBucksStateChanges = [
  //     {'var': 'totalSupply', 'expect': startBalance},
  //     {'var': 'balanceOf.a0', 'expect': startBalance}
  //   ]
  //   await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  // })
  //
  // it('should fail to placeBet if amount is greater than BearBucks balance', async function () {
  //
  //   var cryptoBearsStateChanges = [
  //     {'var': 'balanceOf.a0', 'expect': 1},
  //     {'var': 'ownerOf.b0', 'expect': accounts[0]}
  //   ]
  //   var bearBucksStateChanges = [
  //     {'var': 'totalSupply', 'expect': startBalance},
  //     {'var': 'balanceOf.a0', 'expect': startBalance}
  //   ]
  //   await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  // })
  //
  // it('should fail to placeBet without approving CryptoBearsContract', async function () {
  //
  //   var cryptoBearsStateChanges = [
  //     {'var': 'balanceOf.a0', 'expect': 1},
  //     {'var': 'ownerOf.b0', 'expect': accounts[0]}
  //   ]
  //   var bearBucksStateChanges = [
  //     {'var': 'totalSupply', 'expect': startBalance},
  //     {'var': 'balanceOf.a0', 'expect': startBalance}
  //   ]
  //   await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  // })
  //
  // it('should fail to removeBet if either bear does not exist', async function () {
  //
  //   var cryptoBearsStateChanges = [
  //     {'var': 'balanceOf.a0', 'expect': 1},
  //     {'var': 'ownerOf.b0', 'expect': accounts[0]}
  //   ]
  //   var bearBucksStateChanges = [
  //     {'var': 'totalSupply', 'expect': startBalance},
  //     {'var': 'balanceOf.a0', 'expect': startBalance}
  //   ]
  //   await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  // })
  //
  // it('should fail to removeBet if bear is hungry', async function () {
  //
  //   var cryptoBearsStateChanges = [
  //     {'var': 'balanceOf.a0', 'expect': 1},
  //     {'var': 'ownerOf.b0', 'expect': accounts[0]}
  //   ]
  //   var bearBucksStateChanges = [
  //     {'var': 'totalSupply', 'expect': startBalance},
  //     {'var': 'balanceOf.a0', 'expect': startBalance}
  //   ]
  //   await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  // })
  //
  // it('should fail to removeBet if msg.sender is not owner', async function () {
  //
  //   var cryptoBearsStateChanges = [
  //     {'var': 'balanceOf.a0', 'expect': 1},
  //     {'var': 'ownerOf.b0', 'expect': accounts[0]}
  //   ]
  //   var bearBucksStateChanges = [
  //     {'var': 'totalSupply', 'expect': startBalance},
  //     {'var': 'balanceOf.a0', 'expect': startBalance}
  //   ]
  //   await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  // })
  //
  // it('should fail to removeBet if no bet has been placed', async function () {
  //
  //   var cryptoBearsStateChanges = [
  //     {'var': 'balanceOf.a0', 'expect': 1},
  //     {'var': 'ownerOf.b0', 'expect': accounts[0]}
  //   ]
  //   var bearBucksStateChanges = [
  //     {'var': 'totalSupply', 'expect': startBalance},
  //     {'var': 'balanceOf.a0', 'expect': startBalance}
  //   ]
  //   await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  // })
  //
  // it('should fail to payWinner if either bear does not exist', async function () {
  //
  //   var cryptoBearsStateChanges = [
  //     {'var': 'balanceOf.a0', 'expect': 1},
  //     {'var': 'ownerOf.b0', 'expect': accounts[0]}
  //   ]
  //   var bearBucksStateChanges = [
  //     {'var': 'totalSupply', 'expect': startBalance},
  //     {'var': 'balanceOf.a0', 'expect': startBalance}
  //   ]
  //   await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  // })
  //
  // it('should fail to payWinner if msg.sender is not manager', async function () {
  //
  //   var cryptoBearsStateChanges = [
  //     {'var': 'balanceOf.a0', 'expect': 1},
  //     {'var': 'ownerOf.b0', 'expect': accounts[0]}
  //   ]
  //   var bearBucksStateChanges = [
  //     {'var': 'totalSupply', 'expect': startBalance},
  //     {'var': 'balanceOf.a0', 'expect': startBalance}
  //   ]
  //   await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  // })
  //
  // it('should fail to payWinner if both bets have not been placed', async function () {
  //
  //   var cryptoBearsStateChanges = [
  //     {'var': 'balanceOf.a0', 'expect': 1},
  //     {'var': 'ownerOf.b0', 'expect': accounts[0]}
  //   ]
  //   var bearBucksStateChanges = [
  //     {'var': 'totalSupply', 'expect': startBalance},
  //     {'var': 'balanceOf.a0', 'expect': startBalance}
  //   ]
  //   await checkState([cryptoBears, bearBucks], [cryptoBearsStateChanges, bearBucksStateChanges], accounts)
  // })

})
