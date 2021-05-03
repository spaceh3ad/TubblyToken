const TubblyToken = artifacts.require("./TubblyToken.sol");
const TubblySale = artifacts.require("./TubblySale.sol");

module.exports = function (deployer) {
  deployer.deploy(TubblyToken).then(function() {
  	var tokenPrice =  1_000_000_000_000_000; //10e15 => 1 TBLT = 0.001 ETH
	return deployer.deploy(TubblySale, TubblyToken.address, tokenPrice);
	}).then(function() {
      var tokensAvailable = 750_000;
      // admin the contract launcher ( to this address some tokens will be sends)

      var adminAddress = "0xe5E39a4f38735fd210EcD94ed9A90b9DDA16e06A";
      
      TubblyToken.deployed().then(function(instance) { instance.transfer(TubblySale.address, tokensAvailable, { from: adminAddress });
  	});
   });
};
