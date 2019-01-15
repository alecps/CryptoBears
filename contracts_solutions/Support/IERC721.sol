pragma solidity ^0.4.24;

/**
 * TODO: Add comment
 */
interface IERC721 /*is IERC165*/ {
  /*TODO: comment on ERC165*/

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
  * transfers of tokens to contract addresses that cannot return or use them.
  * We will not be using these functions for this assignment, so our
  * implementation of the ERC721 token standard leaves them out for clarity.
  * Although these functions are not covered in this project, do note that
  * they are required for real world DApps that wish to comply with ERC721 spec.
  * If you wish to learn more about these functions and how they're implemented,
  * check out the OpenZeppelin-Solidity repository.
  * (TODO: add link).
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
