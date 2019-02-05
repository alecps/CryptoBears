pragma solidity ^0.4.24;

import "./Tokens/ERC721.sol";
import "./BearBucks.sol";

/**
 * This contract inherits from ERC721 and implements the feeding and
 * gambling functionality of our DApp. A designated manager address can use
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
  address public _referee;
  address public _minter;

  mapping(uint256 => mapping(uint256 => uint256)) internal _bets;
  Bear[] internal _bears;

  constructor(
    uint256 startBalance,
    uint256 feedingCost,
    uint256 feedingInterval,
    address referee
  ) public {
    //This contract deploys its own instance of the BearBucks contract.
    _BearBucksContract = new BearBucks();
    _startBalance = startBalance;
    _feedingCost = feedingCost;
    _feedingInterval = feedingInterval;
    _referee = referee;
    _minter = referee;
  }

  modifier exists(uint256 bearID) {
    require(_exists(bearID), "Bear with specified ID does not exist.");
    _;
  }

  modifier notHungry(uint256 bearID) {
    require(getMealsNeeded(bearID) == 0, "Your bear is hungry!");
    _;
  }

  modifier onlyReferee() {
    require(msg.sender == _referee, "msg.sender is not _referee.");
    _;
  }

  modifier onlyMinter() {
    require(msg.sender == _minter, "msg.sender is not _minter.");
    _;
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
   * Creates a new CryptoBear token and generates a unique bearID for it.
   * Mints _startBalance BearBucks to the owner of the new bear. This
   * function can only be called by the designated manager address.
   * @param genes A uint256 that encodes the properties of the new bear.
   * @param owner The address that will own the new bear.
   * @param name A string representing the name of the bear.
   * @return The unique bearID (tokenID) of the new CryptoBear.
   *
   */
  function newBear(uint256 genes, address owner, string name)
    public onlyMinter returns(uint256)
  {

    /*Have students choose and explain keyword choice.*/
    /**
     * We use the memory keyword here because we are creating a new instance of
     * the Bear struct, and the contract's storage hasn't allocated space for it
     * yet. If we were to use the storage keyword instead, the compiler would
     * throw an error. If it did not throw an error, we would be overriding
     * data in storage with our new Bear instance, which could cause unintended
     * results. The contract's storage has, however, allocated space for an
     * array of Bear structs, so when we push our new Bear onto the _bears array
     * it is copied safely from memory to storage.
     */
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
    /*Have students choose and explain keyword choice.*/
    /**
    * We use storage here because we don't want to waste gas copying from
    * storage to memory.
    */
    Bear storage bear = _bears[bearID];
    uint256 timeSinceLastFed = now.sub(bear.timeLastFed);
    return timeSinceLastFed.div(_feedingInterval);
  }

  /**
   * @param bearID The unique ID of the bear whose bet we are querying.
   * @param opponentID The unique ID of the bear who the bet is against.
   * @return The size of the bet.
   */
  function getBet(uint256 bearID, uint256 opponentID)
    public view returns(uint256)
  {
    return _bets[bearID][opponentID];
  }

  /**
   * Feeds the specified bear, burning the appropriate amount of BearBucks from
   * the owner's account, updating timeLastFed, and emitting a bearFed event.
   * If the passed amount of BearBucks is more than is necessary to feed the
   * bear, then only the necessary amount is burned.
   * @param bearID The unique ID of the bear we are feeding.
   * @param amount The number of BearBucks to spend feeding the bear.
   */
  function feed(uint256 bearID, uint256 amount) public exists(bearID) {
    /*Begin Solution*/
    require(msg.sender == ownerOf(bearID));
    require(amount >= _feedingCost);
    require(_BearBucksContract.freeBalance(msg.sender) >= amount);

    uint256 mealsNeeded = getMealsNeeded(bearID);
    if (mealsNeeded > 0) {
      uint256 mealsFed = amount.div(_feedingCost);
      if (mealsFed > mealsNeeded) {
        mealsFed = mealsNeeded;
      }
      _BearBucksContract.burn(msg.sender, mealsFed.mul(_feedingCost));
      /*Have students choose and explain keyword choice.*/
      /* We use storage here because we wish to modify the state of the bear. */
      Bear storage bear = _bears[bearID];
      bear.timeLastFed = bear.timeLastFed.add(mealsFed.mul(_feedingInterval));
      emit bearFed(bearID, bear.timeLastFed);
    }
    /*End Solution*/
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
    /*Begin Solution*/
    require(msg.sender == ownerOf(bearID));
    require(amount > 0);
    require(_bets[bearID][opponentID] == 0);

    _BearBucksContract.placeBet(ownerOf(bearID), amount);
    _bets[bearID][opponentID] = amount;

    emit betPlaced(bearID, opponentID, amount);
    /*End Solution*/
  }

  /**
   * Removes bet is BearBucks contract, updates _bets, emits betRemoved event.
   * @param bearID The unique ID of the bear whose bet is being removed.
   * @param opponentID The unique ID of the bear the bet was against.
   */
  function removeBet(uint256 bearID, uint256 opponentID) public {
    /*Begin Solution*/
    require(msg.sender == ownerOf(bearID));
    require(_bets[bearID][opponentID] > 0);

    _BearBucksContract.removeBet(ownerOf(bearID), _bets[bearID][opponentID]);
    _bets[bearID][opponentID] = 0;

    emit betRemoved(bearID, opponentID);
    /*End Solution*/
  }

  /**
   * Transfers award from the loser to the winner, removes bets in BearBucks
   * contract, updates _bets, emits betSettled event.
   *
   * This function is called by the manager account, which is controlled
   * off-chain. We keep the manager code off-chain because the Ethereum
   * blockchain is deterministic, which makes pseudo-random number generators
   * (PRNGs) tricky to implement. If you're curious about PRNGs in smart
   * contracts, check out this article.
   * https://blog.positive.com/predicting-random-numbers-in-ethereum-smart-contracts-e5358c6b8620
   *
   * Note that there is technically a vulnerability with this implementation.
   * As with approve(...) in ERC20.sol, it would be possible to listen
   * for transactions that call this function and call removeBet(...) if
   * you see you've lost the bet. This would set up a race condition where,
   * if you were lucky, nodes might confirm your transaction before the
   * call to payWinner(...). This type of attack is called 'front-running'
   * and it is a problem in many smart contracts. Such attacks, however,
   * are difficult to execute and often not worth worrying about.
   *
   * @param winner The unique ID of the bear who won the bet.
   * @param loser The unique ID of the bear who lost the bet.
   */
  function payWinner(uint256 winner, uint256 loser) public onlyReferee {
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

  /*TODO: get rid of comments */
  /*TODO: Make stencil / proof-read comments */
  /*TODO: rename repository */
}
