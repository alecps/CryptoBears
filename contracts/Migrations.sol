/****************************DO NOT EDIT THIS CODE*****************************/
pragma solidity ^0.4.24;

/**
* This standardized contract is required for Truffle to work correctly. It is
* used to help deploy smart contracts to the blockchain, and does not have any
* specific relevance to our DApp.
*/
contract Migrations {
    address public owner;
    uint public last_completed_migration;

    modifier restricted() {
        if (msg.sender == owner) _;
    }

    constructor() public {
        owner = msg.sender;
    }

    function setCompleted(uint completed) public restricted {
        last_completed_migration = completed;
    }

    function upgrade(address new_address) public restricted {
        Migrations upgraded = Migrations(new_address);
        upgraded.setCompleted(last_completed_migration);
    }
}
