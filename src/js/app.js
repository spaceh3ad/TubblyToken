App = {
	web3Provider: null,
	contracts : {},
	account: '0x0',
	loading: false,
	tokenPrice: 1_000_000_000_000_000,
	tokensSold: 0,
	tokensAvailable: 750_000,


	init: function() {
		console.log("App initialized...")
		return App.initWeb3();
	},

	initWeb3: function() {
		if (typeof window.ethereum !== 'undefined') {
			console.log('MetaMask is installed!');
			App.web3Provider = web3.currentProvider;
			web3 = new Web3(web3.currentProvider);
		} else {
			App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
			web3 = new Web3(App.web3Provider);
		}
		return App.initContracts();
	},

	initContracts: function() {
		$.getJSON("TubblySale.json", function(tubblySale) {
			App.contracts.TubblySale = TruffleContract(tubblySale);
			App.contracts.TubblySale.setProvider(App.web3Provider);
			App.contracts.TubblySale.deployed().then(function(tubblySale) {
				console.log("Tubbly Sale Address:", tubblySale.address);
			})
		}).done(function() {
			$.getJSON("TubblyToken.json", function(tubblyToken) {
				App.contracts.TubblyToken = TruffleContract(tubblyToken);
				App.contracts.TubblyToken.setProvider(App.web3Provider);
				App.contracts.TubblyToken.deployed().then(function(tubblyToken) {
					console.log("Tubbly Token Address:", tubblyToken.address);  
				});
				App.listenForEvents();
				return App.render();
			});
		});
	},

	listenForEvents: function() {
		App.contracts.TubblySale.deployed().then(function(instance) {
			instance.Sell({}, {
				fromBlock: 0,
				toBlock: 'latest',
			}).watch(function(error, event) {
				console.log("event triggered", event);
				App.render();
			})
		})
	},

	render: function() {
		if (App.loading) {
			return;
		}
		App.loading = true;

		var loader = $('#loader');
		var content = $('#content');

		loader.show();
		content.hide();

		web3.eth.getCoinbase(function(err, account) {
			if(err === null){
				App.account = account;
				if(account === null){
					account = "Please approve MetaMask on site."
				}
				$('#accountAddress').html("Your Account: " + account);
			}
		})
		App.contracts.TubblySale.deployed().then(function(instance) {
			tubblyTokenSaleInstance = instance;
			return tubblyTokenSaleInstance.tokenPrice();
		}).then(function(tokenPrice) {
			console.log("tokenPrice", tokenPrice);
			App.tokenPrice = tokenPrice;
			$('.token-price').html(web3.fromWei(App.tokenPrice, "ether").toNumber());
			return tubblyTokenSaleInstance.tokenSold();
		}).then(function(tokenSold) {
			App.tokensSold = tokenSold.toNumber();
			$('.tokens-sold').html(App.tokensSold);
			$('.tokens-available').html(App.tokensAvailable);

			var progressPercent = (Math.ceil(App.tokensSold) / App.tokensAvailable) * 100;
			$('#progress').css('width', progressPercent + '%');

			// Load token contract
			App.contracts.TubblyToken.deployed().then(function(instance) {
				tubblyTokenInstance = instance;
				return tubblyTokenInstance.balanceOf(App.account);
		  	}).then(function(balance) {
				$('.tblt-balance').html(balance.toNumber());
				console.log('my balance', balance.toNumber());
				return tubblyTokenInstance.balanceOf(tubblyTokenSaleInstance.address);
		  	}).then(function(balance2) {
				console.log('balance of tubblySale', balance2.toNumber());

			})
				App.loading = false;
				loader.hide();
				content.show();
		});
	},

	buyTokens: function() {
		$('#content').hide();
		$('#loader').show();
		var numberOfTokens = $('#numberOfTokens').val();
		App.contracts.TubblySale.deployed().then(function(instance) {
			return instance.buyTokens(numberOfTokens, {
				from: App.account,
				value: numberOfTokens * App.tokenPrice,
				gas: 65_000
			});
		}).then(function(result) {
			console.log("Tokens bought...")
			$('form').trigger('reset')
			// wait for sell event
		});
	}		
}

async function enableUser() {
	const accounts = await ethereum.enable();
	const account = accounts[0];
	App.account = account;
	// refresh page to update balance and address
}

$(function() {
	$(window).load(function() {
		App.init();
	})
});
