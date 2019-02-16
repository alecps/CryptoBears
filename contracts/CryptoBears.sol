pragma solidity ^0.4.24;

import "./Tokens/ERC721.sol";
import "./BearBucks.sol";

/**
 * This contract inherits from ERC721 and implements the feeding and
 * gambling functionality of our DApp. A designated minter address can use
 * this contract to create new CryptoBears.
 */
contract CryptoBears is ERC721 {
  string public constant contractName = 'CryptoBears'; // For testing.

  event bearFed(uint256 bearID, uint256 newTimeLastFed);
  event betPlaced(uint256 bettor, uint256 opponent, uint256 amount);
  event betRemoved(uint256 bettor, uint256 opponent);
  event betSettled(uint256 winner, uint256 loser);

  struct Bear {
    uint256 timeOfBirth;
    uint256 genes;
    uint256 timeLastFed;
    string name;
  }

  uint256 public _startBalance;
  uint256 public _feedingCost;
  uint256 public _feedingInterval;

  BearBucks public _BearBucksContract;
  address public _minter;

  mapping(uint256 => mapping(uint256 => uint256)) internal _bets;
  mapping(uint256 => mapping(uint256 => bytes32)) internal _commitments;
  mapping(uint256 => mapping(uint256 => bool)) internal _committed;
  mapping(uint256 => mapping(uint256 => uint256)) internal _secrets;
  mapping(uint256 => mapping(uint256 => bool)) internal _revealed;

  Bear[] internal _bears;

  constructor(
    uint256 startBalance,
    uint256 feedingCost,
    uint256 feedingInterval,
    address minter
  ) public {
    //This contract deploys its own instance of the BearBucks contract.
    _BearBucksContract = new BearBucks();
    _startBalance = startBalance;
    _feedingCost = feedingCost;
    _feedingInterval = feedingInterval;
    _minter = minter;
  }

  modifier exists(uint256 bearID) {
    require(_exists(bearID), "Bear with specified ID does not exist.");
    _;
  }

  modifier notHungry(uint256 bearID) {
    require(getMealsNeeded(bearID) == 0, "Your bear is hungry!");
    _;
  }

  modifier onlyMinter() {
    require(msg.sender == _minter, "msg.sender is not _minter.");
    _;
  }

  /**
   * The following 5 functions are getters used for the testing suite.
   */
  function getBet(uint256 bearID, uint256 opponentID)
    external view returns(uint256)
  {
    return _bets[bearID][opponentID];
  }
  function getCommitment(uint256 bearID, uint256 opponentID)
    external view returns(bytes32)
  {
    return _commitments[bearID][opponentID];
  }
  function isCommitted(uint256 bearID, uint256 opponentID)
    external view returns(bool)
  {
    return _committed[bearID][opponentID];
  }
  function getSecret(uint256 bearID, uint256 opponentID)
    external view returns(uint256)
  {
    return _secrets[bearID][opponentID];
  }
  function isRevealed(uint256 bearID, uint256 opponentID)
    external view returns(bool)
  {
    return _revealed[bearID][opponentID];
  }

  /**
   * Updates the minter address.
   * @param newMinter The address of the new minter.
   */
  function setMinter(address newMinter) public onlyMinter {
    require(newMinter != address(0));
    _minter = newMinter;
    _BearBucksContract.setMinter(newMinter);
  }

   /**
    * Mints a new CryptoBear token and generates a unique bearID for it.
    * Mints _startBalance BearBucks to the owner of the new bear. This
    * function can only be called by the designated minter address.
    * @param genes A uint256 that encodes the properties of the new bear.
    * @param owner The address that will own the new bear.
    * @param name A string representing the name of the bear.
    * @return The unique bearID (tokenID) of the new CryptoBear.
    *
    */
  function newBear(uint256 genes, address owner, string name)
    public onlyMinter returns(uint256)
  {

    /* TODO: Explain why we use the memory keyword here. */
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

  /**
   * @return The total number of CryptoBears in existence.
   */
  function getNumBears() public view returns(uint256) {
    return _bears.length;
  }

  /**
   * @param bearID The unique ID of the bear whose time of birth we are querying.
   * @return A uint256 representing the given bear's time of birth.
   */
  function getTimeOfBirth(uint256 bearID)
    external exists(bearID) view returns(uint256)
  {
    return _bears[bearID].timeOfBirth;
  }

  /**
   * @param bearID The unique ID of the bear whose time last fed we are querying.
   * @return A uint256 representing the given bear's time last fed.
   */
  function getTimeLastFed(uint256 bearID)
    external exists(bearID) view returns(uint256)
  {
    return _bears[bearID].timeLastFed;
  }

  /**
   * @param bearID The unique ID of the bear whose meals needed we are querying.
   * @return A uint256 representing the meals needed by the given bear.
   */
  function getMealsNeeded(uint256 bearID)
    public exists(bearID) view returns(uint256)
  {
    /* TODO: Explain why we use the memory keyword here. */
    Bear storage bear = _bears[bearID];
    uint256 timeSinceLastFed = now.sub(bear.timeLastFed);
    return timeSinceLastFed.div(_feedingInterval);
  }

  /**
   * Feeds the specified bear, burning the appropriate amount of BearBucks from
   * the owner's account, updating timeLastFed, and emitting a bearFed event.
   * If the passed amount of BearBucks is more than is necessary to feed the
   * bear, then only the necessary amount is burned.
   *
   * If you use either the memory or storage keyword here, remember to explain
   * why.
   *
   * @param bearID The unique ID of the bear we are feeding.
   * @param amount The number of BearBucks to spend feeding the bear.
   */
  function feed(uint256 bearID, uint256 amount) public exists(bearID) {

    /*TODO*/

  }

  /**
   * Places bet in BearBucks contract, updates _bets, emits betPlaced event.
   * @param bearID The unique ID of the bear placing the bet.
   * @param opponentID The unique ID of the bear against whom the bet is placed.
   * @param amount The size of the bet.
   */
  function placeBet(uint256 bearID, uint256 opponentID, uint256 amount)
    public exists(bearID) exists(opponentID) notHungry(bearID)
  {

    /*TODO*/

  }

  /**
   * Removes bet in BearBucks contract, deletes bet from _bets, emits betRemoved
   * event. This function should revert if the bear has already committed their
   * bet.
   * @param bearID The unique ID of the bear whose bet is being removed.
   * @param opponentID The unique ID of the bear the bet was against.
   */
  function removeBet(uint256 bearID, uint256 opponentID) public {

    /*TODO*/

  }

  /**
   * Commits to a bet by updating the _commitment and _committed mappings.
   * @param bearID The unique ID of the bear whose owner is calling commit.
   * @param opponentID The unique ID of the bear's opponent.
   * @param hash_r The hash of msg.sender's secret for the bet.
   */
  function commit(uint256 bearID, uint256 opponentID, bytes32 hash_r) public {

    /*TODO*/

  }

  /**
   * Determines who wins the bet and calls payWinner accordingly.
   *
   * Use this to get the hash of r: keccak256(abi.encodePacked(r))
   *
   * @param bearID The unique ID of the bear whose owner is calling reveal.
   * @param opponentID The unique ID of the bear's opponent.
   * @param r A uint256 randomly generated by msg.sender as their secret for
   * the bet.
   */
  function reveal(uint256 bearID, uint256 opponentID, uint256 r) public {

    /*TODO*/

  }

  /**
   * Determines who wins the bet and calls payWinner accordingly.
   * @param bearID The unique ID of the bear who revealed their secret last.
   * @param opponentID The unique ID of the bear who revealed their secret first.
   */
  function flipCoin(uint256 bearID, uint256 opponentID) private {
    bool result = (
      ((_secrets[bearID][opponentID] ^ _secrets[opponentID][bearID]).mod(2)) == 1
    );
    if (result) {
      payWinner(bearID, opponentID);
    } else {
      payWinner(opponentID, bearID);
    }
  }

  /**
   * Transfers award from the loser to the winner, removes bets in BearBucks
   * contract, deletes bet from _bets, deletes all relevant mapping values,
   * emits betSettled event.
   * @param winner The unique ID of the bear who won the bet.
   * @param loser The unique ID of the bear who lost the bet.
   */
  function payWinner(uint256 winner, uint256 loser) private {

    /*TODO*/

  }

}
