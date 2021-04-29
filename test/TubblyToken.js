var TubblyToken = artifacts.require('./TubblyToken.sol');

contract('TubblyToken', function(accounts) {
	var tokenInstance;

	it('intitialzes the contract with correct values', function() {
		return TubblyToken.deployed().then(function(instance){
			tokenInstance = instance;
			return tokenInstance.name();
		}).then(function(name) {
			assert.equal(name, 'TubblyToken', 'name is correct');
			return tokenInstance.symbol();
		}).then(function(symbol) {
			assert.equal(symbol, 'TBLT', 'symbol is correct');
		});
	});
	it('allocates total supply upon deployment', function() {
		return TubblyToken.deployed().then(function(instance){
			tokenInstance = instance;
			return tokenInstance.totalSupply();
		}).then(function(totalSupply) {
			assert.equal(totalSupply.toNumber(), 1_000_000, 'sets total supply to 1_000_000');
			return tokenInstance.balanceOf(accounts[0]);
		}).then(function(adminBalance) {
			assert.equal(adminBalance.toNumber(), 1_000_000, 'it allocates intitial supply to admin');
		});
	});

	it('transfers token ownership', function(){
		return TubblyToken.deployed().then(function(instance) {
			tokenInstance = instance;
			return tokenInstance.transfer.call(accounts[1], 9999999999999999);
		}).then(assert.fail).catch(function(error) {
			assert(error.message, 'error message must contain revert');
			return tokenInstance.transfer.call(accounts[1], 250_000, {from: accounts[0] });
		}).then(function(success){
			assert.equal(success, true, 'it returns true');
			return tokenInstance.transfer(accounts[1], 250_000, { from: accounts[0] });
		}).then(function(result) {
			assert.ok(result.receipt.status, 'it returns true');
			assert.equal(result.receipt.logs[0].event, 'Transfer', 'should be Transfer event');
			assert.equal(result.receipt.logs[0].args._from, accounts[0], 'logs the spender account ');
			assert.equal(result.receipt.logs[0].args._to, accounts[1], 'logs the receiver account');
			assert.equal(result.receipt.logs[0].args._value, 250_000, 'logs the transfer amount');
			return tokenInstance.balanceOf(accounts[1]);
		}).then(function(balance) {
			assert.equal(balance.toNumber(), 250_000, 'Send amount to account');
			return tokenInstance.balanceOf(accounts[0]);
		}).then(function(balance) {
			assert.equal(balance.toNumber(), 750_000, 'deducts amount from sender');
		});
	});



});