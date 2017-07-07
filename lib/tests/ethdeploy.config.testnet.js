'use strict';

var sign = require('ethjs-signer').sign;
var SignerProvider = require('ethjs-provider-signer');

/*
// should return in callback, new contracts object
function loader(sourceMap, loaderConfig, environment) {
  return {};
}

// should return output file string
function plugin() {
  this.process = (output, config) => { return ''; };
}

// should return environment object
function transformEnvironment(environment, cb) {
  cb(null, environment);
}

// ethdeploy method
function ethdeploy(config, cb) {
  cb(null, { output: '', environment: {} })
}
*/

/*
ENV setup
1. environment {} -> prepped environment {}
2. build report method FN

Build Contracts
3. environment {}, report FN -> loaders
4. loader output {} -> post processor filters {}

Run deployment
5. run deployment FN -> output String

Run plugins
6. output String -> run plugins

Output result
7. output String, enviroment JSON -> callback
--
File writes
8. write file
*/

module.exports = function (options) {
  return {
    entry: ['environments.json', 'contracts'],
    output: {
      path: './',
      filename: 'environments.json'
    },
    module: {
      preLoaders: [{ test: /\.(json)$/, loader: './loaders/environment.js', build: true, include: /(environments)/ }],
      loaders: [{ test: /\.(sol)$/, loader: './loaders/solc.js', optimize: 1 }, { test: /\.(json)$/, loader: './loaders/solc-json.js' }],
      environment: {
        name: 'ropsten',
        provider: new SignerProvider('https://ropsten.infura.io:8545', {
          accounts: function accounts(cb) {
            cb(null, ['0x2233eD250Ea774146B0fBbC1da0Ffa6a81514cCC']);
          },
          signTransaction: function signTransaction(rawTx, cb) {
            cb(null, sign(rawTx, '0x..privateKey...'));
          }
        }),
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
    },
    plugins: [new options.plugins.JSONMinifier()]
  };
};