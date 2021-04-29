const TubblyToken = artifacts.require("TubblyToken.sol");

module.exports = function (deployer) {
  deployer.deploy(TubblyToken);
};
