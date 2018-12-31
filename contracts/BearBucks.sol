pragma solidity ^0.4.24;

import "./Tokens/ERC20.sol";

contract BearBucks is ERC20 {

  string public constant contractName = 'BearBucks';

  address public _CryptoBearsContract;

  /*Begin Solution*/
  mapping(address => uint256) private _betSum;
  /*End Solution*/

  constructor() {
    _CryptoBearsContract = msg.sender;
  }

  modifier onlyCryptoBearsContract() {
    require(msg.sender == _CryptoBearsContract);
    _;
  }

  function betSum(address owner) view returns(uint256) {
    /*Begin Solution*/
    return _betSum[owner];
    /*End Solution*/
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
    require(allowance(owner, _CryptoBearsContract) >= _betSum[owner].add(amount));
    _betSum[owner] = _betSum[owner].add(amount);
    /*End Solution*/
  }

  function removeBet(address owner, uint256 amount) onlyCryptoBearsContract {
    /*Begin Solution*/
    _betSum[owner] = _betSum[owner].sub(amount);
    /*End Solution*/
  }

  /*Begin Solution*/
  function approve(address spender, uint256 value) returns (bool) {
    if(spender == _CryptoBearsContract) {
      require(value >= _betSum[msg.sender]);
    }
    super.approve(spender, value);
  }
  /*End Solution*/

}
