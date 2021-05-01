const TubblyToken = artifacts.require("./TubblyToken.sol");
const TubblySale = artifacts.require("./TubblySale.sol");

module.exports = function (deployer) {
  deployer.deploy(TubblyToken).then(function() {
  	var tokenPrice =  1_000_000_000_000_000;
	return deployer.deploy(TubblySale, TubblyToken.address, tokenPrice);
	}).then(function() {
      var tokensAvailable = 750_000;
      var adminAddress = "0x19e5AB9097006D32A7C303fF6D580d1c02E3c61F";
      TubblyToken.deployed().then(function(instance) { instance.transfer(TubblySale.address, tokensAvailable, { from: adminAddress });
  	});
   });
};
