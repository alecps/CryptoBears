pragma solidity ^0.4.24;

import "./Tokens/ERC20.sol";

/**
 * This contract is instantiated by the CryptoBears contract and inherits from
 * ERC20. It gives the CryptoBears contract the ability to mint/burn BearBucks
 * and keeps track of the total amount of BearBucks each player is actively
 * betting.
 */
contract BearBucks is ERC20 {
  string public constant contractName = 'BearBucks'; // For testing.

  /*Begin Solution*/
  mapping(address => uint256) private _betSum;
  /*End Solution*/

  /* Stores address of the CryptoBears contract instantiating this contract. */
  address public _CryptoBearsContract;

  constructor() {
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
   * Calls the internal _mint function inherited from our ERC20 implementation,
   * but adds check to ensure only the CryptoBears contract can mint BearBucks.
   * @param to The address to mint BearBucks to.
   * @param amount A uint256 representing the quantity of BearBucks to mint.
   */
  function mint(address to, uint256 amount) onlyCryptoBearsContract {
    _mint(to, amount);
  }

  /**
   * Calls the internal _burn function inherited from our ERC20 implementation,
   * but adds check to ensure only the CryptoBears contract can burn BearBucks.
   * @param from The address whose BearBucks we are burning.
   * @param amount A uint256 representing the quantity of BearBucks to burn.
   */
  function burn(address from, uint256 amount) onlyCryptoBearsContract {
    _burn(from, amount);
  }

  /**
   * Gets the sum of all active bets placed by the given address.
   * @param owner The address whose active bets we are summing.
   * @return The total number of BearBucks owner is currently betting.
   */
  function betSum(address owner) view returns(uint256) {
    /*Begin Solution*/
    return _betSum[owner];
    /*End Solution*/
  }

  /*Begin Solution*/
  /**
   * @param owner The address whose free (not-in-bet) balance we are querying.
   * @return The balance of owner minus the betSum of owner.
   */
  function freeBalance(address owner) view returns(uint256) {
    return balanceOf(owner).sub(_betSum[owner]);
  }
  /*End Solution*/

  /**
   * Adds to the sum of active bets placed by the given address.
   * @param owner The address for which the bet is being placed.
   * @param amount The number of BearBucks being bet as a uint256.
   */
  function placeBet(address owner, uint256 amount) onlyCryptoBearsContract {
    /*Begin Solution*/
    require(freeBalance(owner) >= amount);
    require(allowance(owner, _CryptoBearsContract) >= _betSum[owner].add(amount));
    _betSum[owner] = _betSum[owner].add(amount);
    /*End Solution*/
  }

  /**
   * Subtracts from the sum of active bets placed by the given address.
   * @param owner The address whose bet is being removed.
   * @param amount The number of BearBucks no longer being bet.
   */
  function removeBet(address owner, uint256 amount) onlyCryptoBearsContract {
    /*Begin Solution*/
    _betSum[owner] = _betSum[owner].sub(amount);
    /*End Solution*/
  }

  /*Begin Solution*/
  /**
   * Overrides approve(...) from ERC20 contract, adding a check to prevent
   * users from decreasing the allowance of the CryptoBears contract below their
   * betSum. Without this check, users could prevent funds from being transfered
   * from them when they lose bets.
   */
  function approve(address spender, uint256 value) returns (bool) {
    if(spender == _CryptoBearsContract) {
      require(value >= _betSum[msg.sender]);
    }
    super.approve(spender, value);
  }
  /*End Solution*/

}
