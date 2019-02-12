pragma solidity ^0.4.24;

import "./Tokens/ERC20.sol";

/**
 * This contract is instantiated by the CryptoBears contract and inherits from
 * ERC20. It gives the CryptoBears contract the ability to mint/burn BearBucks
 * and keeps track of the total amount of BearBucks each player is actively
 * betting. A minter address other than the CryptoBears contract can later be
 * added with the setMinter(...) function.
 */
contract BearBucks is ERC20 {
  string public constant contractName = 'BearBucks'; // For testing.

  /* Stores address of the CryptoBears contract instantiating this contract. */
  address public _CryptoBearsContract;

  /* Stores address of a minter address if one is added. */
  address public _minter;

  constructor() public {
    _CryptoBearsContract = msg.sender;
  }

  /**
   * Modifier that ensures msg.sender is the CryptoBears contract that
   * instantiated this contract.
   */
  modifier onlyCryptoBearsContract() {
    require(msg.sender == _CryptoBearsContract,
      "msg.sender is not cryptoBears contract.");
    _;
  }

  /**
   * Modifier that ensures msg.sender is the CryptoBears contract that
   * instantiated this contract or the minter account.
   */
  modifier onlyMinterOrCryptoBearsContract() {
    require(msg.sender == _CryptoBearsContract || msg.sender == _minter,
      "msg.sender is not cryptoBears contract or minter account.");
    _;
  }

  /**
   * Updates the minter address.
   * @param newMinter The address of the new minter.
   */
  function setMinter(address newMinter) public onlyCryptoBearsContract {
    _minter = newMinter;
  }

  /**
   * Calls the internal _mint function inherited from our ERC20 implementation,
   * but adds check to ensure only the CryptoBears contract can mint BearBucks.
   * @param to The address to mint BearBucks to.
   * @param amount A uint256 representing the quantity of BearBucks to mint.
   */
  function mint(
    address to,
    uint256 amount
  ) public onlyMinterOrCryptoBearsContract {
    _mint(to, amount);
  }

  /**
   * Calls the internal _burn function inherited from our ERC20 implementation,
   * but adds check to ensure only the CryptoBears contract can burn BearBucks.
   * @param from The address whose BearBucks we are burning.
   * @param amount A uint256 representing the quantity of BearBucks to burn.
   */
  function burn(address from, uint256 amount) public onlyCryptoBearsContract {
    _burn(from, amount);
  }

  /**
   * Gets the sum of all active bets placed by the given address.
   * @param owner The address whose active bets we are summing.
   * @return The total number of BearBucks owner is currently betting.
   */
  function betSum(address owner) public view returns(uint256) {

    /*TODO*/

  }

  /**
   * Adds to the sum of active bets placed by the given address.
   * @param owner The address for which the bet is being placed.
   * @param amount The number of BearBucks being bet as a uint256.
   */
  function placeBet(
    address owner,
    uint256 amount
  ) public onlyCryptoBearsContract {

    /*TODO*/

  }

  /**
   * Subtracts from the sum of active bets placed by the given address.
   * @param owner The address whose bet is being removed.
   * @param amount The number of BearBucks no longer being bet.
   */
  function removeBet(
    address owner,
    uint256 amount
  ) public onlyCryptoBearsContract {

    /*TODO*/

  }

}
