'use strict';

var sign = require('ethjs-signer').sign;
var SignerProvider = require('ethjs-provider-signer');

module.exports = function (options) {
  return {
    entry: [],
    output: {
      path: './',
      filename: 'environments.json'
    },
    module: {
      environment: {
        name: 'ropsten',
        provider: new SignerProvider('https://ropsten.infura.io', {
          accounts: function accounts(cb) {
            return cb(null, ['0x2233eD250Ea774146B0fBbC1da0Ffa6a81514cCC']);
          },
          signTransaction: function signTransaction(rawTx, cb) {
            cb(null, sign(rawTx, '0x..privateKey...'));
          }
        })
      },
      deployment: function deployment(deploy, contracts, done) {
        done();
      }
    },
    plugins: [new options.plugins.JSONMinifier()]
  };
};