pragma solidity ^0.4.24;

import "../Support/IERC20.sol";
import "../Support/SafeMath.sol";

/**
* This contract implements the ERC20 token standard. In addition to the
* functions specified by the IERC20 interface it has two internal functions,
* _mint and _burn, which allow tokens to be created and destroyed. Four of the
* below functions have been left for you to fill in. Although you are welcome
* to copy the solutions verbatem from the OpenZeppelin-Solidity repository, we
* recommend that you take a stab at implementing them yourself first, as it will
* aid in your understanding of the code and make the rest of the assignment
* easier. The ERC20 standard is incredibly important in the world of smart
* contract developement, and it is useful to to know the code well.
*/
contract ERC20 is IERC20 {
 /*
  * Allows use of the SafeMath library in this contract and all contracts
  * that inherit from it. You must use this library for all mathematical
  * operations. See SafeMath.sol in the Support folder for available functions.
  */
  using SafeMath for uint256;

  /* Stores the token balance of each address. */
  mapping (address => uint256) private _balances;

  /* Stores all allowances. */
  mapping (address => mapping (address => uint256)) private _allowed;

 /*
  * NOTE: ERC20 spec requires Transfer events to be emmitted whenever _balances
  * is modified and Approval events to be emmitted whenever _allowed is
  * modified.
  */

  /* Stores the total supply of the token. */
  uint256 private _totalSupply;

 /**
  * @return The totalSupply of the token as a uint256.
  */
  function totalSupply() public view returns (uint256) {
    return _totalSupply;
  }

 /**
  * Gets the balance of the specified address.
  * @param owner The address to query the balance of.
  * @return The amount of tokens owned by the passed address as a uint256.
  */
  function balanceOf(address owner) public view returns (uint256) {
    return _balances[owner];
  }

  /**
   * Gets the amount of tokens the spender may spend on the owner's behalf.
   * @param owner The address which owns the funds.
   * @param spender The address to query the allowance of.
   * @return The allowance of the spender as a uint256.
   */
  function allowance(address owner, address spender)
    public view returns (uint256)
  {
    /*Begin Solution*/
    return _allowed[owner][spender];
    /*End Solution*/
  }

 /**
  * Transfers the specified amount of tokens to the given address.
  * @param to The address to transfer tokens to.
  * @param value The amount of tokens to be transfered as a uint256.
  * @return true on successful completion.
  */
  function transfer(address to, uint256 value) public returns (bool) {
    _transfer(msg.sender, to, value);
    return true;
  }

  /**
   * Approves the passed address to spend the specified amount of tokens on
   * behalf of msg.sender.
   * Beware that changing an allowance with this method brings the risk that
   * someone may use both the old and the new allowance by unfortunate
   * transaction ordering. One possible solution to mitigate this race
   * condition is to first reduce the spender's allowance to 0 and set the
   * desired value afterwards:
   * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729.
   * @param spender The address which will spend the funds.
   * @param value The amount of tokens to be spent as a uint256.
   * @return true on successful completion.
   */
  function approve(address spender, uint256 value) public returns (bool) {
    require(spender != address(0));
    _allowed[msg.sender][spender] = value;
    emit Approval(msg.sender, spender, value);
    return true;
  }

  /**
   * Transfers tokens from one address to another using a spender allowance.
   * @param from The address which you want to send tokens from.
   * @param to The address which you want to transfer tokens to.
   * @param value The amount of tokens to be transfered as a uint256.
   * @return true on successful completion.
   */
  function transferFrom(address from, address to, uint256 value)
    public returns (bool)
  {
    /*Begin Solution*/
    require(value <= _allowed[from][msg.sender]);//You technically don't need this check because of SafeMath.

    _allowed[from][msg.sender] = _allowed[from][msg.sender].sub(value);
    _transfer(from, to, value);
    /*End Solution*/

    return true;
  }

 /**
  * Internal function performs transfer between specified addresses.
  * @param from The address to transfer tokens from.
  * @param to The address to transfer tokens to.
  * @param value The amount of tokens to be transfered.
  */
  function _transfer(address from, address to, uint256 value) internal {
    /*Begin Solution*/
    require(value <= _balances[from]);//You technically don't need this check because of SafeMath.
    require(to != address(0));

    _balances[from] = _balances[from].sub(value);
    _balances[to] = _balances[to].add(value);
    emit Transfer(from, to, value);
    /*End Solution*/
  }

  /**
   * Internal function mints an amount of the token and assigns it to an address.
   * @param account The address that will receive the created tokens.
   * @param value The amount of tokens that will be created.
   */
  function _mint(address account, uint256 value) internal {
    /*Begin Solution*/
    require(account != address(0));
    _totalSupply = _totalSupply.add(value);
    _balances[account] = _balances[account].add(value);
    emit Transfer(address(0), account, value);
    /*End Solution*/
  }

  /**
   * Internal function burns an amount of the token from a given address.
   * @param account The address whose tokens will be burned.
   * @param value The amount of tokens that will be burned.
   */
  function _burn(address account, uint256 value) internal {
    require(account != address(0));
    require(value <= _balances[account]);

    _totalSupply = _totalSupply.sub(value);
    _balances[account] = _balances[account].sub(value);
    emit Transfer(account, address(0), value);
  }

}
