pragma solidity ^0.4.24;

import "./CryptoBears.sol";
import "./BearBucks.sol";
import "./Support/SafeMath.sol";

/**
 * This contract allows users to buy CryptoBears and BearBucks. In order
 * to function correctly, it must be set as the minter in the CryptoBears
 * and BearBucks contracts. This is done by calling setMinter(...) on the
 * CryptoBears contract and passing in the address of this contract.
 * The two external functions of this contract, buyBearBucks(...) and
 * buyCryptoBear(...) have been left for you to fill in.
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

  /**
   * Buys as many BearBucks as possible with the wei sent with the transaction.
   * @param beneficiary The address that will own the newly minted BearBucks.
   * @return The number of BearBucks purchased.
   */
  function buyBearBucks(address beneficiary) public payable returns(uint256) {
    /* Begin Solution */
    uint256 wei_sent = msg.value;
    uint256 tokens = wei_to_BearBucks(wei_sent);
    uint256 wei_used = BearBucks_to_wei(tokens);

    _weiRaised = _weiRaised.add(wei_used);

    _bb.mint(beneficiary, tokens);

    finalize(wei_sent, wei_used);
    return tokens;
    /* End Solution */
  }

  /**
   * Buys one CryptoBear if sufficient funds are sent with transaction.
   * @param genes A uint256 that encodes the properties of the new bear.
   * @param beneficiary The address that will own the new bear.
   * @param name A string representing the name of the bear.
   * @return The unique bearID (tokenID) of the new CryptoBear.
   */
  function buyCryptoBear(
    uint256 genes,
    address beneficiary,
    string name
  ) public payable returns(uint256) {
    /* Begin Solution */
    uint256 wei_sent = msg.value;
    uint256 wei_used = _CryptoBearPrice;

    _weiRaised = _weiRaised.add(wei_used);

    uint256 bearID = _cb.newBear(genes, beneficiary, name);

    finalize(wei_sent, wei_used);
    return bearID;
    /* End Solution */
  }

  /* Begin Solution */

  /**
   * Converts wei to BearBucks.
   * @param wei_amount The amount of wei to convert to BearBucks.
   * @return The amount of BearBucks purchaseable with the given amount of wei.
   */
  function wei_to_BearBucks(uint256 wei_amount) internal view returns(uint256) {
    require(wei_amount >= _BearBucksPrice,
      "Not enough wei to purchase BearBucks!");
    return wei_amount.div(_BearBucksPrice);
  }

  /**
   * Converts BearBucks to wei.
   * @param tokens The amount of BearBucks to convert to wei.
   * @return The value of the BearBucks in wei.
   */
  function BearBucks_to_wei(uint256 tokens) internal view returns(uint256) {
    return tokens.mul(_BearBucksPrice);
  }

  /**
   * Finishes the purchase by transfering to wallet address and returning
   * unspent wei.
   * @param wei_sent The amount of wei sent in the purchase.
   * @param wei_used The amount of wei used in the purchase.
   */
  function finalize(uint256 wei_sent, uint256 wei_used) internal {
    /* Use first code block for correct implementation. */

    require(wei_sent >= wei_used);
    return_unused_wei(wei_sent, wei_used);
    _wallet.transfer(wei_used);

    /* Use second code block for hackable implementation. */

    // if (wei_sent >= wei_used) {
    //   return_unused_wei(wei_sent, wei_used);
    // }

  }

  /**
   * Returns excess wei sent in purchase transaction to msg.sender.
   * @param wei_sent The amount of wei sent in the purchase.
   * @param wei_used The amount of wei used in the purchase.
   */
  function return_unused_wei(uint256 wei_sent, uint256 wei_used) internal {
    if (wei_sent > wei_used) {
      uint256 val = wei_sent.sub(wei_used);

      /**
       * Use .transfer(val) for correct implementation.
       * Use .call.value(val)() for hackable implementation.
       */
      //msg.sender.transfer(val);
      msg.sender.call.value(val)();
    }
  }

  /* End Solution */

}
