/****************************DO NOT EDIT THIS CODE*****************************/
pragma solidity ^0.4.24;

/**
* This interface specifies the functions that must be implemented in order to
* comply with the ERC721 token standard. By inheriting this interface, our
* ERC721 contract garauntees compliance with the standard —— the contract will
* not compile unless all the required functions are implemented.
*
* Note that the full ERC721 token standard has a couple requirements which we
* leave out of this assignment. See the comments below for more information.
*
* To learn more about interfaces, see the Solidity docs:
* https://solidity.readthedocs.io/en/v0.4.24/contracts.html#interfaces
*/
interface IERC721 /*is IERC165*/ {
  /**
  * Technically, the ERC721 spec requires that the IERC165 interface be
  * implemented. The ERC165 standard is inherited by ERC721 tokens and
  * consists of a single function, supportsInterface(bytes4 _interfaceId),
  * which is used to query whether a contract implements an interface. In short,
  * it would provide a way to check whether our contract is an ERC721 token.
  * This is important on the MainNet, but supporting it here would add
  * unneccesary and confusing support code. If you'd like to take a look at the
  * ERC165 standard, check out the OpenZeppelin-Solidity repository:
  * https://github.com/OpenZeppelin/openzeppelin-solidity/tree/master/contracts/introspection
  */

  event Transfer(
    address indexed from,
    address indexed to,
    uint256 indexed tokenId
  );

  event Approval(
    address indexed owner,
    address indexed approved,
    uint256 indexed tokenId
  );

  event ApprovalForAll(
    address indexed owner,
    address indexed operator,
    bool approved
  );

  function balanceOf(address owner)
    external view returns (uint256 balance);

  function ownerOf(uint256 tokenId)
    external view returns (address owner);

  function approve(address to, uint256 tokenId)
    external;

  function getApproved(uint256 tokenId)
    external view returns (address operator);

  function setApprovalForAll(address operator, bool _approved)
    external;

  function isApprovedForAll(address owner, address operator)
    external view returns (bool);

  function transferFrom(address from, address to, uint256 tokenId)
    external;

  /**
  * Technically, the ERC721 spec requires the following two functions to be
  * implemented in all compliant tokens. They are designed to prevent accidental
  * transfers of ERC721 tokens to contract addresses that cannot return or use
  * them. We will not be using these functions for this assignment, so our
  * implementation of the ERC721 token standard leaves them out for clarity.
  * Although these functions are not covered in this project, do note that
  * they are required for MainNet DApps that wish to comply with ERC721 spec.
  * If you wish to learn more about these functions and how they're implemented,
  * check out the OpenZeppelin-Solidity repository:
  * https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/contracts/token/ERC721/ERC721.sol
  */

  // function safeTransferFrom(address from, address to, uint256 tokenId)
  //   external;
  //
  // function safeTransferFrom(
  //   address from,
  //   address to,
  //   uint256 tokenId,
  //   bytes data
  // )
  //   public;

}
