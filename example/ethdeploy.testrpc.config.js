const TestRPC = require('ethereumjs-testrpc'); // eslint-disable-line

module.exports = (options) => ({ // eslint-disable-line
  entry: [
    './environments.json',
    './contracts',
  ],
  output: {
    path: './',
    filename: 'environments.json',
    safe: true,
  },
  module: {
    environment: {
      name: 'testrpc',
      provider: TestRPC.provider(),
      defaultTxObject: {
        from: 1,
        gas: 3000001,
      },
    },
    preLoaders: [
      { test: /\.(json)$/, loader: 'ethdeploy-environment-loader', build: true },
    ],
    loaders: [
      { test: /\.(sol)$/, loader: 'ethdeploy-solc-loader' },
    ],
    deployment: (deploy, contracts, done) => {
      deploy(contracts['contracts/SimpleStore.sol:SimpleStore'], 458977, { from: 0 }).then(() => {
        done();
      });
    },
  },
  plugins: [
    new options.plugins.JSONFilter(),
    new options.plugins.JSONExpander(),
  ],
});
