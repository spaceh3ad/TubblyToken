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
		}).then(function(receipt) {
			assert.equal(receipt.logs.length, 1, 'it returns true');
			assert.equal(receipt.logs[0].event, 'Transfer', 'should be Transfer event');
			assert.equal(receipt.logs[0].args._from, accounts[0], 'logs the spender account ');
			assert.equal(receipt.logs[0].args._to, accounts[1], 'logs the receiver account');
			assert.equal(receipt.logs[0].args._value, 250_000, 'logs the transfer amount');
			return tokenInstance.balanceOf(accounts[1]);
		}).then(function(balance) {
			assert.equal(balance.toNumber(), 250_000, 'Send amount to account');
			return tokenInstance.balanceOf(accounts[0]);
		}).then(function(balance) {
			assert.equal(balance.toNumber(), 750_000, 'deducts amount from sender');
		});
	});

	it('approves tokens for delegated transfers', function() {
		return TubblyToken.deployed().then(function(instance) {
			tokenInstance = instance;
			return tokenInstance.approve.call(accounts[1], 100);
		}).then(function(success) {
			assert.equal(success, true, 'it returns true')
			return tokenInstance.approve(accounts[1], 100, { from: accounts[0] });
		}).then(function(receipt) {
			assert.equal(receipt.logs.length, 1, 'it returns true');
			assert.equal(receipt.logs[0].event, 'Approval', 'should be Approval event');
			assert.equal(receipt.logs[0].args._owner, accounts[0], 'logs the spender account ');
			assert.equal(receipt.logs[0].args._spender, accounts[1], 'logs the receiver account');
			assert.equal(receipt.logs[0].args._value, 100, 'logs the approve amount');		
			return tokenInstance.allowance(accounts[0], accounts[1]);
		}).then(function(allowance) {
			assert.equal(allowance.toNumber(), 100, 'stores allowance for delegated transfers');
		});
	});

	it('handles delegated transfers', function() {
		return TubblyToken.deployed().then(function(instance) {
			tokenInstance = instance;
			fromAccount = accounts[2];
			toAccount = accounts[3];
			spendingAccount = accounts[4];
			return tokenInstance.transfer(fromAccount, 100, { from: accounts[0] });
		}).then(function(result) {
			return tokenInstance.approve(spendingAccount, 10, { from: fromAccount });
		}).then(function(result) {
			return tokenInstance.transferFrom(fromAccount, toAccount, 10000, { from: spendingAccount });
		}).then(assert.fail).catch(function(error) {
	        assert(error.message.indexOf('revert') >= 0, 'cannot transfer value larger than balance');
			return tokenInstance.transferFrom(fromAccount, toAccount, 20, { from: spendingAccount });
		}).then(assert.fail).catch(function(error) {
			assert(error.message.indexOf('revert') >= 0, 'cannot transfer value larger than approved amount');
			return tokenInstance.transferFrom.call(fromAccount, toAccount, 10, { from: spendingAccount });
		}).then(function(success) {
			assert.equal(success, true);
			return tokenInstance.transferFrom(fromAccount, toAccount, 10, { from: spendingAccount });
		}).then(function(receipt) {
			assert.equal(receipt.logs.length, 1, 'it returns true');
			assert.equal(receipt.logs[0].event, 'Transfer', 'should be Transfer event');
			assert.equal(receipt.logs[0].args._from, fromAccount, 'logs the spender account ');
			assert.equal(receipt.logs[0].args._to, toAccount, 'logs the receiver account');
			assert.equal(receipt.logs[0].args._value, 10, 'logs the transfer amount');		
			return tokenInstance.balanceOf(fromAccount);
		}).then(function(balance) {
			assert.equal(balance.toNumber(), 90, 'deducts amount from the sending account');
			return tokenInstance.balanceOf(toAccount);
		}).then(function(balance) {
			assert.equal(balance.toNumber(), 10, 'adds amount from reveiving account');
			return tokenInstance.allowance(fromAccount, spendingAccount);
		}).then(function(allowance) {
			assert.equal(allowance.toNumber(), 0, 'deducts amount from the allowance');
		})
	});


});