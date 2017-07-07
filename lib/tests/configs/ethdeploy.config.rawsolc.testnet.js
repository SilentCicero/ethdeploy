'use strict';

var TestRPC = require('ethereumjs-testrpc');

module.exports = function () {
  return {
    entry: {
      SimpleStore: {}
    },
    sourceMapper: function sourceMapper(entry, cb) {
      return cb(null, entry);
    },
    module: {
      preLoaders: [{ loader: '../loaders/raw-solc-json.js' }],
      environment: {
        name: 'ropsten',
        provider: TestRPC.provider(),
        defaultTxObject: {
          from: 0,
          gas: 3000000
        }
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