pragma solidity ^0.8.0;

contract TubblyToken {
	
	string public name = "TubblyToken";
	string public symbol = "TBLT";

	uint256 public totalSupply = 1_000_000;

	event Transfer(
		address indexed _from,
		address indexed _to ,
		uint256 _value
	);

	mapping(address => uint256) public balanceOf;

	constructor() {
		balanceOf[msg.sender] += totalSupply;
	}

	function transfer (address _to, uint256 _value) public returns(bool success) {
		require(balanceOf[msg.sender] >= _value, 'Not enough funds');
		
		balanceOf[msg.sender] -= _value;
		balanceOf[_to] += _value;
		emit Transfer(msg.sender, _to, _value);
		return true;
	}
			
}