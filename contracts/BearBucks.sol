pragma solidity ^0.4.24;

import "./Tokens/ERC20.sol";

contract BearBucks is ERC20 {

  address CryptoBearsContract;

  /*Begin Solution*/
  mapping(address => uint256) private betSum;
  /*End Solution*/

  constructor() {
    CryptoBearsContract = msg.sender;
  }

  modifier onlyCryptoBearsContract() {
    require(msg.sender == CryptoBearsContract);
    _;
  }

  function mint(address to, uint256 amount) onlyCryptoBearsContract {
    _mint(to, amount);
  }

  function burn(address from, uint256 amount) onlyCryptoBearsContract {
    _burn(from, amount);
  }

  function placeBet(address owner, uint256 amount) onlyCryptoBearsContract {
    /*Begin Solution*/
    require(balanceOf(owner) >= amount);
    require(allowance(owner, CryptoBearsContract) >= betSum[owner].add(amount));
    betSum[owner] = betSum[owner].add(amount);
    /*End Solution*/
  }

  function removeBet(address owner, uint256 amount) onlyCryptoBearsContract {
    /*Begin Solution*/
    betSum[owner] = betSum[owner].sub(amount);
    /*End Solution*/
  }

  /*Begin Solution*/
  function approve(address spender, uint256 value) returns (bool) {
    if(spender == CryptoBearsContract) {
      require(value >= betSum[msg.sender]);
    }
    super.approve(spender, value);
  }
  /*End Solution*/

}
