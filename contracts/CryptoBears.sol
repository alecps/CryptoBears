pragma solidity ^0.4.24;

import "./Tokens/ERC721.sol";
import "./BearBucks.sol";

contract CryptoBears is ERC721 {

  event bearFed(
    uint256 bearID
  );

  event betPlaced(
    uint256 bettor,
    uint256 opponent,
    uint256 amount
  );

  event betRemoved(
    uint256 bettor,
    uint256 opponent
  );

  struct Bear {
    uint timeOfBirth;
    uint genes;
    uint feedBefore;
    string name;
  }

  Bear[] bears;

  mapping(uint256 => mapping(uint256 => uint256)) bets;

  uint constant startBalance = 100;
  uint constant feedingCost = 20;
  uint constant feedingInterval = 1 minutes;

  BearBucks BearBucksContract;

  constructor() {
    BearBucksContract = new BearBucks();
  }


  function newBear(uint256 genes, address owner, string name) returns(uint) {

    Bear memory bear = Bear({
      timeOfBirth: now,
      genes: genes,
      feedBefore: now + feedingInterval,
      name: name
    });

    uint256 bearID = bears.push(bear) - 1;
    _mint(owner, bearID);
    BearBucksContract.mint(owner, startBalance);
    return bearID;
  }

  function feed(uint256 bearID, uint256 amount) {
    /*Begin Solution*/
    require(msg.sender == ownerOf(bearID));
    require(BearBucksContract.balanceOf(msg.sender) >= amount);

    BearBucksContract.burn(msg.sender, amount);
    Bear storage bear = bears[bearID];
    bear.feedBefore = now + feedingInterval;
    emit bearFed(bearID);
    /*End Solution*/
  }

  function placeBet(uint256 bearID, uint256 opponentID, uint256 amount) {
    /*Begin Solution*/
    require(msg.sender == ownerOf(bearID));
    require(amount > 0);
    require(bets[bearID][opponentID] == 0);

    BearBucksContract.placeBet(msg.sender, amount);
    bets[bearID][opponentID] = amount;

    emit betPlaced(bearID, opponentID, amount);
    /*End Solution*/
  }

  function removeBet(uint256 bearID, uint256 opponentID) {
    /*Begin Solution*/
    require(msg.sender == ownerOf(bearID));
    require(bets[bearID][opponentID] > 0);

    BearBucksContract.removeBet(ownerOf(bearID), bets[bearID][opponentID]);
    bets[bearID][opponentID] = 0;

    emit betRemoved(bearID, opponentID);
    /*End Solution*/
  }

  function payWinner(uint256 winner, uint256 loser) external {
    /*Begin Solution*/
    require(bets[winner][loser] > 0 && bets[loser][winner] > 0);

    BearBucksContract.transferFrom(
      ownerOf(loser), ownerOf(winner), bets[loser][winner]
    );
    removeBet(winner, loser);
    removeBet(loser, winner);
    /*End Solution*/
  }

}
