var TubblySale = artifacts.require('./TubblySale.sol');
var TubblyToken = artifacts.require('./TubblyToken.sol');

contract('TubblySale', function(accounts) {
	var tokenInstance;
	var tokenSaleInstance;
	var admin = accounts[0];
	var buyer = accounts[1];
	var tokenPrice = 1_000_000_000_000_000; // 10e15
	var tokensAvailable = 750_000;
	var numberOfTokens;

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

	it('faciliates token buying', function() {
		return TubblyToken.deployed().then(function(instance) {
			tokenInstance = instance;
			return TubblySale.deployed();
		}).then(function(instance) {
			tokenSaleInstance = instance;
			return tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, { from: admin })
		}).then(function(receipt) {
			numberOfTokens = 0;
			return tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: numberOfTokens * tokenPrice })
		}).then(function(receipt) {
			assert.equal(receipt.logs.length, 1, 'it returns true');
			assert.equal(receipt.logs[0].event, 'Sell', 'should be Sell event');
			assert.equal(receipt.logs[0].args._buyer, buyer, 'logs the buyer account ');
			assert.equal(receipt.logs[0].args._amount, numberOfTokens, 'logs number of tokens bought');
			return tokenSaleInstance.tokenSold();
		}).then(function(amount) {
			assert.equal(amount.toNumber(), numberOfTokens, 'increments the number of tokens sold');
			return tokenInstance.balanceOf(buyer);
		}).then(function(balance) {
			assert.equal(balance.toNumber(), numberOfTokens);
			return tokenInstance.balanceOf(tokenSaleInstance.address);
		}).then(function(balance) {
			assert.equal(balance.toNumber(), tokensAvailable - numberOfTokens);
			return tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: 1 });
		}).then(assert.fail).catch(function(error) {
			assert(error.message.indexOf('revert') >= 0, 'msg.value must equal number of tokens in wei');
			return tokenSaleInstance.buyTokens(80_000, { from: buyer, value: numberOfTokens * tokenPrice })
		}).then(assert.fail).catch(function(error) {
			assert(error.message.indexOf('revert') >= 0, 'cannot purchase more tokens then available');
		});
	});

	it('ends token sale', function() {
		return TubblyToken.deployed().then(function(instance) {
			tokenInstance = instance;
			return TubblySale.deployed();
		}).then(function(instance) {
			tokenSaleInstance = instance;
			return tokenSaleInstance.endSale({ from: buyer });
		}).then(assert.fail).catch(function(error) {
			assert(error.message.indexOf('revert') >= 0, 'must be admin to end sale');
			return tokenSaleInstance.endSale({ from: admin });
		}).then(function(receipt) {
			return tokenInstance.balanceOf(admin);
		}).then((balance) => {
			assert.equal(
				balance.toNumber(),
				999990,
				'returns unsold tokens to admin'
				);
				return tokenInstance.balanceOf(tokenSaleInstance.address);
			})
			.then((balance) => {
	      		assert.equal(balance.toNumber(), 0, 'contract has been reset');
		});
	});

	// it('checks if anyone can buy after ICO ended', function() {
	// 	return TubblyToken.deployed().then(function(instance) {
	// 		tokenInstance = instance;
	// 		return TubblySale.deployed();
	// 	}).then(function(instance) {
	// 		tokenSaleInstance = instance;
	// 		return tokenSaleInstance.buyTokens( { from: buyer });
	// 	}).then(assert.fail).catch(function(error) {
	// 		assert(error.message.indexOf('revert') >= 0, 'ICO ended, cannot buy tokens.')
	// 	});
	// });
});

