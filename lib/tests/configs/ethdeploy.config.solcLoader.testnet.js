'use strict';

var TestRPC = require('ethereumjs-testrpc'); // eslint-disable-line
// const HttpProvider = require('ethjs-provider-http');

module.exports = function (options) {
  return { // eslint-disable-line
    entry: ['./environments.json', './src/tests/contracts'],
    output: {
      path: './',
      filename: 'environments.json',
      safe: true
    },
    module: {
      environment: {
        name: 'testrpc',
        provider: TestRPC.provider(),
        defaultTxObject: {
          from: 1,
          gas: 3000001
        }
      },
      preLoaders: [{ test: /\.(json)$/, loader: 'ethdeploy-environment-loader', build: true }],
      loaders: [{ test: /\.(sol)$/, exclude: /(test)/, loader: 'ethdeploy-solc-loader', optimize: 1 }],
      deployment: function deployment(deploy, contracts, done) {
        deploy(contracts.SimpleStore, { from: 0 }).then(function () {
          done();
        });
      }
    },
    plugins: [
      // new options.plugins.JSONMinifier(),
    ]
  };
};