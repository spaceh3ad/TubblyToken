pragma solidity ^0.8.0;

/**
 * The TubblySale contract does this and that...
 */

import "./TubblyToken.sol";

contract TubblySale {

	address admin;
	TubblyToken public tokenContract;
	uint256 public tokenPrice;

	constructor(TubblyToken _tokenContract, uint256 _tokenPrice) {
		admin = msg.sender;
		tokenContract = _tokenContract;
    	tokenPrice = _tokenPrice;
  }
}
