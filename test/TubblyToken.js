var TubblyToken = artifacts.require('./TubblyToken.sol');

contract('TubblyToken', function(accounts) {
	it('sets total supply upon deployment', function() {
		return TubblyToken.deployed().then(function(instance){
			tokenInstance = instance;
			return tokenInstance.totalSupply();
		}).then(function(totalSupply) {
			assert.equal(totalSupply.toNumber(), 10_000_000, 'sets total supply to 1_000_000');
		});
	});
})