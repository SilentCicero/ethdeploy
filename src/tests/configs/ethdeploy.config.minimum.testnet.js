const sign = require('ethjs-signer').sign;
const SignerProvider = require('ethjs-provider-signer');

module.exports = (options) => ({
  entry: [],
  output: {
    path: './',
    filename: 'environments.json',
  },
  module: {
    environment: {
      name: 'ropsten',
      provider: new SignerProvider('https://ropsten.infura.io', {
        accounts: (cb) => cb(null, ['0x2233eD250Ea774146B0fBbC1da0Ffa6a81514cCC']),
        signTransaction: (rawTx, cb) => {
          cb(null, sign(rawTx, '0x..privateKey...'));
        },
      }),
    },
    deployment: (deploy, contracts, done) => {
      done();
    },
  },
  plugins: [
    new options.plugins.JSONMinifier(),
  ],
});
