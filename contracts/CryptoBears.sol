pragma solidity ^0.4.24;

import "./Tokens/ERC721.sol";
import "./BearBucks.sol";

contract CryptoBears is ERC721 {

  event bearFed(uint256 bearID, uint newTimeLastFed);

  event betPlaced(uint256 bettor, uint256 opponent, uint256 amount);

  event betRemoved(uint256 bettor, uint256 opponent);

  event betSettled(uint256 winner, uint256 loser);

  struct Bear {
    uint timeOfBirth;
    uint genes;
    uint timeLastFed;
    string name;
  }

  string public constant contractName = 'CryptoBears';

  Bear[] _bears;

  mapping(uint256 => mapping(uint256 => uint256)) _bets;

  uint _startBalance;
  uint _feedingCost;
  uint _feedingInterval;

  BearBucks public _BearBucksContract;
  address public _manager;

  constructor(
    uint startBalance,
    uint feedingCost,
    uint feedingInterval,
    address manager
  ) {
    _BearBucksContract = new BearBucks();
    _startBalance = startBalance;
    _feedingCost = feedingCost;
    _feedingInterval = feedingInterval;
    _manager = manager;
  }

  modifier exists(uint256 bearID) {
    require(_exists(bearID));
    _;
  }

  modifier notHungry(uint256 bearID) {
    require(getMealsNeeded(bearID) == 0, "Your bear is hungry!");
    _;
  }

  modifier onlyManager() {
    require(msg.sender == _manager, "msg.sender is not manager");
    _;
  }

  function newBear(uint256 genes, address owner, string name)
    onlyManager returns(uint256)
  {

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
    if (mealsNeeded > 0) {
      uint mealsFed = amount.div(_feedingCost);
      if (mealsFed > mealsNeeded) {
        mealsFed = mealsNeeded;
      }
      _BearBucksContract.burn(msg.sender, mealsFed.mul(_feedingCost));
      Bear storage bear = _bears[bearID];
      bear.timeLastFed = bear.timeLastFed.add(mealsFed.mul(_feedingInterval));
      emit bearFed(bearID, bear.timeLastFed);
    }
    /*End Solution*/
  }

  function getNumBears() view returns(uint256) {
    return _bears.length;
  }

  function getMealsNeeded(uint256 bearID)
    exists(bearID) view returns(uint)
  {
    Bear memory bear = _bears[bearID];
    uint timeSinceLastFed = now.sub(bear.timeLastFed);
    return timeSinceLastFed.div(_feedingInterval);
  }

  function getTimeLastFed(uint256 bearID)
    external exists(bearID) view returns(uint) {
      return _bears[bearID].timeLastFed;
  }

  function getTimeOfBirth(uint256 bearID)
    external exists(bearID) view returns(uint) {
      return _bears[bearID].timeOfBirth;
  }

  function placeBet(uint256 bearID, uint256 opponentID, uint256 amount)
    exists(bearID) exists(opponentID) notHungry(bearID)
  {
    /*Begin Solution*/
    require(msg.sender == ownerOf(bearID));
    require(amount > 0);
    require(_bets[bearID][opponentID] == 0);

    _BearBucksContract.placeBet(ownerOf(bearID), amount);
    _bets[bearID][opponentID] = amount;

    emit betPlaced(bearID, opponentID, amount);
    /*End Solution*/
  }

  /*WARNING: I think there might be a bug / vulnerability with feeding while bets are active*/

  /*WARNING: self bets imply self transferFrom*/

  function removeBet(uint256 bearID, uint256 opponentID) {
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

  /*NOTE: Race condition vulnerability. Remove bet when this transaction is posted */
  function payWinner(uint256 winner, uint256 loser) onlyManager {
    /*Begin Solution*/
    require(_bets[winner][loser] > 0 && _bets[loser][winner] > 0);

    _BearBucksContract.transferFrom(
      ownerOf(loser), ownerOf(winner), _bets[loser][winner]
    );
    _BearBucksContract.removeBet(ownerOf(winner), _bets[winner][loser]);
    _bets[winner][loser] = 0;
    _BearBucksContract.removeBet(ownerOf(loser), _bets[loser][winner]);
    _bets[loser][winner] = 0;
    emit betSettled(winner, loser);
    /*End Solution*/
  }

  //TODO: deal with vulnerabilities, check for doubles and more
  //TODO: test events

}
