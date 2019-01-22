/****************************DO NOT EDIT THIS CODE*****************************/
pragma solidity ^0.4.24;//Tells the compiler which version of Solidity to use.

/**
* This interface specifies the functions that must be implemented in order to
* comply with the ERC20 token standard. By inheriting this interface, our ERC20
* contract garauntees compliance with the standard —— the contract will not
* compile unless all the required functions are implemented.
*
* To learn more about interfaces, see the Solidity docs:
* https://solidity.readthedocs.io/en/v0.4.24/contracts.html#interfaces
*/
interface IERC20 {

  event Transfer(
    address indexed from,
    address indexed to,
    uint256 value
  );

  event Approval(
    address indexed owner,
    address indexed spender,
    uint256 value
  );

  function totalSupply()
    external view returns (uint256);

  function balanceOf(address who)
    external view returns (uint256);

  function allowance(address owner, address spender)
    external view returns (uint256);

  function transfer(address to, uint256 value)
    external returns (bool);

  function approve(address spender, uint256 value)
    external returns (bool);

  function transferFrom(address from, address to, uint256 value)
    external returns (bool);

}
