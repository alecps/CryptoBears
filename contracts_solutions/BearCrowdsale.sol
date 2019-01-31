pragma solidity ^0.4.24;

import "./CryptoBears.sol";
import "./BearBucks.sol";
import "./Support/SafeMath.sol";

/**
 * TODO: add header
 */
contract BearCrowdsale {
  using SafeMath for uint256;
  string public constant contractName = 'BearCrowdsale'; // For testing.

  CryptoBears public _cb;
  BearBucks public _bb;
  address private _wallet;
  uint256 public _weiRaised;
  uint256 public _BearBucksPrice;
  uint256 public _CryptoBearPrice;

  constructor (
    address wallet,
    CryptoBears cb,
    uint256 BearBucksPrice,
    uint256 CryptoBearsPrice
  ) public {
    require(wallet != address(0));
    require(address(cb) != address(0));
    require(BearBucksPrice > 0);
    require(CryptoBearsPrice > 0);

    _wallet = wallet;
    _bb = BearBucks(cb._BearBucksContract());
    _cb = cb;
    _BearBucksPrice = BearBucksPrice;
    _CryptoBearPrice = CryptoBearsPrice;
  }

  /*TODO: add header */
  function buyBearBucks(address beneficiary) public payable returns(uint256) {
    //require(beneficiary != address(0));
    //require(msg.value != 0);//TODO: why not greater than?

    uint256 wei_sent = msg.value;
    uint256 tokens = wei_to_BearBucks(wei_sent);
    uint256 wei_used = BearBucks_to_wei(tokens);

    _weiRaised = _weiRaised.add(wei_used);

    _bb.mint(beneficiary, tokens);

    finalize(wei_sent, wei_used);
    return tokens;
  }

  /*TODO: add header */
  function buyCryptoBear(
    uint256 genes,
    address beneficiary,
    string name
  ) public payable returns(uint256) {
    //require(beneficiary != address(0));

    uint256 wei_sent = msg.value;
    uint256 wei_used = _CryptoBearPrice;

    _weiRaised = _weiRaised.add(wei_used);

    uint256 bearID = _cb.newBear(genes, beneficiary, name);

    finalize(wei_sent, wei_used);
    return bearID;
  }

  /*TODO: add header */
  function wei_to_BearBucks(uint256 wei_amount) internal view returns(uint256) {
    require(wei_amount >= _BearBucksPrice,
      "Not enough wei to purchase BearBucks!");
    return wei_amount.div(_BearBucksPrice);
  }

  /*TODO: add header */
  function BearBucks_to_wei(uint256 tokens) internal view returns(uint256) {
    return tokens.mul(_BearBucksPrice);
  }

  /*TODO: add header */
  function finalize(uint256 wei_sent, uint256 wei_used) internal {
    require(wei_sent >= wei_used);
    return_unused_wei(wei_sent, wei_used);
    _wallet.transfer(wei_used);
  }

  /*TODO: add header */
  function return_unused_wei(uint256 wei_sent, uint256 wei_used) internal {
    if (wei_sent > wei_used) {
      msg.sender.transfer(wei_sent.sub(wei_used));
    }
  }

}
