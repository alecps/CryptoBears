pragma solidity ^0.4.24;

import "../BearBucks.sol";
import "../CryptoBears.sol";

/**
* When writing truffle tests in node.js, we are able to specify msg.sender when
* calling contract functions. This is important when testing cases that involve
* multiple users interacting with the contract. When writing tests in Solidity,
* however, we lose the ability to specify msg.sender as the test contract is
* always the sender. The purpose of this contract is to allow us to call
* functions from addresses other than the test contract's like we do in node.js.
* THIS CONTRACT IS ONLY USED FOR TESTING PURPOSES AND IS NOT PART OF
* THE DAPP. ONLY EDIT THIS FILE IN THE AREA SPECIFIED BELOW.
*/
contract Redirector {
    CryptoBears public cb;
    BearBucks public bb;
    address public owner;

    modifier onlyOwner() {
      require(msg.sender == owner);
      _;
    }

    constructor(CryptoBears _cb, BearBucks _bb) public {
      owner = msg.sender;
      cb = _cb;
      bb = _bb;
    }

    function bb_transferFrom(address from, address to, uint256 value) onlyOwner {
      bb.transferFrom(from, to, value);
    }

    function cb_transferFrom(address from, address to, uint256 tokenId) onlyOwner {
      cb.transferFrom(from, to, tokenId);
    }

    function bb_approve(address spender, uint256 value) onlyOwner {
      bb.approve(spender, value);
    }

    function placeBet(uint256 bearID, uint256 opponentID, uint256 amount) onlyOwner {
      cb.placeBet(bearID, opponentID, amount);
    }

    function removeBet(uint256 bearID, uint256 opponentID) onlyOwner {
      cb.removeBet(bearID, opponentID);
    }

    function bb_transfer(address to, uint256 value) onlyOwner {
      bb.transfer(to, value);
    }

    /* TODO: Add forwarding functions like the ones above as needed. */


}
