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

    /*TODO*/

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

    /*TODO*/

  }

}
