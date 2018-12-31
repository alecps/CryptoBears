pragma solidity ^0.4.24;

import "./Tokens/ERC721.sol";
import "./BearBucks.sol";

contract CryptoBears is ERC721 {

  event bearFed(
    uint256 bearID,
    uint newTimeLastFed
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
    uint timeLastFed;
    string name;
  }

  string public constant contractName = 'CryptoBears';

  Bear[] public _bears;

  mapping(uint256 => mapping(uint256 => uint256)) _bets;

  uint _startBalance;
  uint _feedingCost;
  uint _feedingInterval;

  BearBucks _BearBucksContract;

  constructor(
    uint startBalance,
    uint feedingCost,
    uint feedingInterval
  ) {
    _BearBucksContract = new BearBucks();
    _startBalance = startBalance;
    _feedingCost = feedingCost;
    _feedingInterval = feedingInterval;
  }

  modifier exists(uint256 bearID) {
    require(_exists(bearID));
    _;
  }

  modifier notHungry(uint256 bearID) {
    require(getMealsNeeded(bearID) == 0, "Your bear is hungry!");
    _;
  }

  function getBearBucksContract() external view returns(address) {
    return _BearBucksContract;
  }

  function newBear(uint256 genes, address owner, string name) returns(uint) {

    Bear memory bear = Bear({
      timeOfBirth: now,
      genes: genes,
      timeLastFed: now,
      name: name
    });

    uint256 bearID = _bears.push(bear) - 1;
    _mint(owner, bearID);
    _BearBucksContract.mint(owner, _startBalance);
    return bearID;
  }

  function feed(uint256 bearID, uint256 amount) exists(bearID) {
    /*Begin Solution*/
    require(msg.sender == ownerOf(bearID));
    require(_BearBucksContract.balanceOf(msg.sender) >= amount);

    uint mealsNeeded = getMealsNeeded(bearID);
    require(mealsNeeded > 0);

    uint mealsFed = amount.div(_feedingCost);
    if (mealsFed > mealsNeeded) {
      mealsFed = mealsNeeded;
    }
    _BearBucksContract.burn(msg.sender, mealsFed.mul(_feedingCost));
    Bear storage bear = _bears[bearID];
    bear.timeLastFed = bear.timeLastFed.add(mealsFed.mul(_feedingInterval));
    emit bearFed(bearID, bear.timeLastFed);
    /*End Solution*/
  }

  function getMealsNeeded(uint256 bearID)
    exists(bearID) view returns(uint)
  {
    Bear memory bear = _bears[bearID];
    uint timeSinceLastFed = now.sub(bear.timeLastFed);
    return timeSinceLastFed.div(_feedingInterval);
  }

  function placeBet(uint256 bearID, uint256 opponentID, uint256 amount)
    exists(bearID) exists(opponentID) notHungry(bearID)
  {
    /*Begin Solution*/
    require(msg.sender == ownerOf(bearID));
    require(amount > 0);
    require(_bets[bearID][opponentID] == 0);

    _BearBucksContract.placeBet(msg.sender, amount);
    _bets[bearID][opponentID] = amount;

    emit betPlaced(bearID, opponentID, amount);
    /*End Solution*/
  }

  function removeBet(uint256 bearID, uint256 opponentID)
    exists(bearID) exists(opponentID) notHungry(bearID)
  {
    /*Begin Solution*/
    require(msg.sender == ownerOf(bearID));
    require(_bets[bearID][opponentID] > 0);

    _BearBucksContract.removeBet(ownerOf(bearID), _bets[bearID][opponentID]);
    _bets[bearID][opponentID] = 0;

    emit betRemoved(bearID, opponentID);
    /*End Solution*/
  }

  function getBet(uint256 bearID, uint256 opponentID) view returns(uint256) {
    return _bets[bearID][opponentID];
  }

  function payWinner(uint256 winner, uint256 loser)
    exists(winner) exists(loser) external
  {
    /*Begin Solution*/
    require(_bets[winner][loser] > 0 && _bets[loser][winner] > 0);

    _BearBucksContract.transferFrom(
      ownerOf(loser), ownerOf(winner), _bets[loser][winner]
    );
    removeBet(winner, loser);
    removeBet(loser, winner);
    /*End Solution*/
  }

}
