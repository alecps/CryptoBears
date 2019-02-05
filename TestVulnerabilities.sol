pragma solidity ^0.4.24;

import "truffle/Assert.sol";
import "../contracts_solutions/BearBucks.sol";
import "../contracts_solutions/CryptoBears.sol";
import "../contracts_solutions/Support/Redirector.sol";

contract TestVulnerabilities {
  uint256 constant startBalance = 100;
  uint256 constant feedingCost = 20;
  uint256 constant feedingInterval = 60;
  Redirector account_1;
  Redirector account_2;
  Redirector account_3;
  uint256 bear0;
  uint256 bear1;
  uint256 bear2;
  uint256 bear3;
  CryptoBears cb;
  BearBucks bb;


  function beforeAll() {
    cb = new CryptoBears(startBalance, feedingCost, feedingInterval, this);
    bb = BearBucks(cb._BearBucksContract());
    account_1 = new Redirector(cb, bb);
    account_2 = new Redirector(cb, bb);
    account_3 = new Redirector(cb, bb);
    bear0 = cb.newBear(0, this, 'Bruno');
    bear1 = cb.newBear(0, account_1, 'Pooh');
    bear2 = cb.newBear(0, account_2, 'Paddington');
    //bear3 = cb.newBear(0, account_3, 'Ted');
  }

  /* Add tests below here. */

  function testExample1() {
    Assert.equal(cb.contractName(), "CryptoBears", "Custom Error Message");
    Assert.equal(bb.contractName(), "BearBucks", "Name Doesnt Match!");
  }

  function testExample2() {
    Assert.equal(bear1, 1, "Error: Unexpected BearID");
    Assert.equal(bb.balanceOf(account_1), startBalance, "Incorrect startBalance!");
  }

  function testExample3() {
    // Place bet.
    bb.approve(cb, startBalance);
    cb.placeBet(bear0, bear1, startBalance);

    // Have account_1 place bet.
    account_1.bb_approve(cb, feedingCost); // This is how we send TX's from other addresses. See Redirector.sol for more info.
    account_1.placeBet(bear1, bear0, feedingCost);

    // Try to swipe away contract allowance.
    bb.approve(cb, 0); // If you've fixed this vulnerability, this line should cause a revert.

    // Check state.
    Assert.isAtMost(bb.betSum(this), bb.allowance(this, cb), "Error: BetSum is greater than CryptoBears allowance!");

    // Reset state.
    cb.removeBet(bear0, bear1);
    bb.approve(cb, 0);
    account_1.removeBet(bear1, bear0);
    account_1.bb_approve(cb, 0);
  }

  // /* Find more vulnerabilities! */
  //
  // /* Begin Solution */
  // function testAllowanceVulnerability() {
  //   // Place bet.
  //   bb.approve(cb, startBalance);
  //   cb.placeBet(bear0, bear1, startBalance);
  //
  //   // Approve another account to spend on your behalf.
  //   bb.approve(account_2, startBalance);
  //   // Have that account transfer your funds to themselves.
  //   account_2.bb_transferFrom(this, account_2, startBalance);
  //
  //   // Is your betSum greater than your balance?
  //   Assert.isBelow(bb.betSum(this), bb.balanceOf(this), "Error: BetSum is greater than balance!");
  //
  //   // Reset state.
  //   cb.removeBet(bear0, bear1);
  //   bb.approve(cb, 0);
  //   account_2.bb_transfer(this, startBalance);
  // }
  // /* End Solution */

 }
