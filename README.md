# CryptoBears

TODO:

- fix reentrancy attack. Students shouldn't have to remove the check that msg.value >= CryptoBearsPrice
in order to make the attack work.

- remove or change same bear bets tests so that order of operations in pay winner doesnt matter. Currently,
tests fail if the following lines aren't called in this order. This shouldn't be required as it's unintuitive
and difficult to debug. A lot of students got stuck on this.

      BearBucksContract.removeBet(ownerOf(winner), bets[winner][loser]);
      delete(bets[winner][loser]);
      BearBucksContract.removeBet(ownerOf(loser), bets[loser][winner]);
      delete(bets[loser][winner]);

- fix ERC20 and ERC721 tests to not depend on BearBucks and CryptoBears contracts.

- Fix confusing diff output when event emitted is not as expected. Currently, it prints the diff
of BigNumbers. 
