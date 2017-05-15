const sign = require('ethjs-signer').sign;
const SignerProvider = require('ethjs-provider-signer');

module.exports = () => ({
  entry: {
    ropsten: {
      SimpleStore: {
      },
    },
    mainnet: {
      SomeOtherContract: {
      },
    },
  },
  sourceMapper: (entry, cb) => cb(null, entry),
  module: {
    preLoaders: [
      { loader: '../loaders/raw-environment.js' },
    ],
    environment: {
      name: 'ropsten',
      provider: new SignerProvider('http://localhost:8545', {
        accounts: (cb) => cb(null, ['0x2233eD250Ea774146B0fBbC1da0Ffa6a81514cCC']),
        signTransaction: (rawTx, cb) => {
          cb(null, sign(rawTx, '0x..privateKey...'));
        },
      }),
    },
    deployment: (deploy, contracts, done) => {
      deploy(contracts.SimpleStore).then((simpleStoreInstance) => {
        console.log(simpleStoreInstance); // eslint-disable-line

        done();
      });
    },
  },
});
