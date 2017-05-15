const sign = require('ethjs-signer').sign;
const SignerProvider = require('ethjs-provider-signer');

module.exports = (options) => ({
  entry: [
    'environments.json',
    'contracts',
  ],
  output: {
    path: './',
    filename: 'environments.json',
  },
  module: {
    environment: {
      name: 'ropsten',
      provider: new SignerProvider('http://localhost:8545', {
        accounts: (cb) => cb(null, ['0x2233eD250Ea774146B0fBbC1da0Ffa6a81514cCC']),
        signTransaction: (rawTx, cb) => {
          cb(null, sign(rawTx, '0x..privateKey...'));
        },
      }),
      defaultTxObject: {
        from: 0,
        gas: 3000000,
      },
    },
    deployment: (deploy, contracts, done) => {
      done();
    },
  },
  plugins: [
    new options.plugins.JSONMinifier(),
  ],
});
