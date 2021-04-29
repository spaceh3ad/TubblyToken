const TubblyToken = artifacts.require("./TubblyToken.sol");
const TubblySale = artifacts.require("./TubblySale.sol");

module.exports = function (deployer) {
  deployer.deploy(TubblyToken).then(function() {
  	var tokenPrice =  1_000_000_000_000_000;
	return deployer.deploy(TubblySale, TubblyToken.address, tokenPrice);
  });
};
