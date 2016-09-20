var assert = require('assert');
const Web3 = require('web3');
const web3 = new Web3();
var TestRPC = require("ethereumjs-testrpc");
var server = TestRPC.server();
const contracts = require('./lib/classes.json');
const deployer = require('../index.js');
const testEthdeployModule = require('./test.ethdeply.config.js');

before(function(done){
  server.listen("8545", function(err, blockchain) {
    if(!err && blockchain) {
      web3.setProvider(new Web3.providers.HttpProvider('http://localhost:8545'));
      done();
    }
  });
});

describe('Test Deployer', function() {
  describe('#getAccounts', function() {
    it('should have TestRPC accuonts present', function(done) {
      web3.eth.getAccounts(function(err, result){
        assert.ok(!err);
        assert.ok(result.length > 1);
        done();
      });
    });

    it('should have contracts in the JSON file', function(){
      assert.ok(contracts.SimpleStore);
    });

    it('should deploy contracts to TestRPC and return callback', function(done){
      deployer(testEthdeployModule, function(deployError, deployObject){
        console.log(deployError, deployObject);

        if (deployObject) {
          done();
        }
      });
    });
  });
});
