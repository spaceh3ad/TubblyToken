var TubblySale= artifacts.require('./TubblySale.sol');

contract('TubblySale', function(accounts) {
	var tokenSaleInstance;
	var tokenPrice = 1_000_000_000_000_000; //10e15

	it('initializes contract with correct values', function() {
		return TubblySale.deployed().then(function(instance) {
			tokenSaleInstance = instance;
			return tokenSaleInstance.address
		}).then(function(address) {
			assert.notEqual(address, 0x0, 'has contract address');
			return tokenSaleInstance.tokenContract();
		}).then(function(address) {
			assert.notEqual(address, 0x0, 'has token contract address');
			return tokenSaleInstance.tokenPrice();
		}).then(function(price) {
			assert.equal(price, tokenPrice, 'token price is correct');
		});
	});
});