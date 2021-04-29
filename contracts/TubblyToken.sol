pragma solidity ^0.8.0;

contract TubblyToken {
	uint256 public totalSupply;

	constructor() {
		totalSupply += 1_000_000;
	}	
}