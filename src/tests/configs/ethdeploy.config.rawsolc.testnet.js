const TestRPC = require('ethereumjs-testrpc');

module.exports = () => ({
  entry: {
    SimpleStore: {
    },
  },
  sourceMapper: (entry, cb) => cb(null, entry),
  module: {
    preLoaders: [
      { loader: '../loaders/raw-solc-json.js' },
    ],
    environment: {
      name: 'ropsten',
      provider: TestRPC.provider(),
      defaultTxObject: {
        from: 0,
        gas: 3000000,
      },
    },
    deployment: (deploy, contracts, done) => {
      deploy(contracts.SimpleStore).then((simpleStoreInstance) => {
        console.log(simpleStoreInstance); // eslint-disable-line

        done();
      });
    },
  },
});
