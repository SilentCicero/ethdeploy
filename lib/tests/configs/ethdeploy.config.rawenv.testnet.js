'use strict';

var sign = require('ethjs-signer').sign;
var SignerProvider = require('ethjs-provider-signer');

module.exports = function () {
  return {
    entry: {
      ropsten: {
        SimpleStore: {}
      },
      mainnet: {
        SomeOtherContract: {}
      }
    },
    sourceMapper: function sourceMapper(entry, cb) {
      return cb(null, entry);
    },
    module: {
      preLoaders: [{ loader: '../loaders/raw-environment.js' }],
      environment: {
        name: 'ropsten',
        provider: new SignerProvider('http://localhost:8545', {
          accounts: function accounts(cb) {
            return cb(null, ['0x2233eD250Ea774146B0fBbC1da0Ffa6a81514cCC']);
          },
          signTransaction: function signTransaction(rawTx, cb) {
            cb(null, sign(rawTx, '0x..privateKey...'));
          }
        })
      },
      deployment: function deployment(deploy, contracts, done) {
        deploy(contracts.SimpleStore).then(function (simpleStoreInstance) {
          console.log(simpleStoreInstance); // eslint-disable-line

          done();
        });
      }
    }
  };
};