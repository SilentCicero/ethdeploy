const contracts = require('./lib/classes.json');

module.exports = {
  output: {
    environment: 'testrpc',
    path: './tests/lib/environments.json',
  },
  entry: {
    testrpc: contracts,
  },
  module: function(deploy, contracts, environment){
    deploy(contracts.SimpleStoreRegistry).then(function(simpleStoreRegistry){
      deploy(contracts.SimpleStoreFactory, simpleStoreRegistry.address).then(function(factoryInstance){
        deploy(contracts.CustomSimpleStore);
        deploy(contracts.AnotherCustomSimpleStore).then(function(contractInstance){
        });
      });
    });
  },
  config: {
    defaultAccount: 0,
    defaultGas: 3000000,
    environments: {
      testrpc: {
        provider: {
          type: 'http',
          host: 'http://localhost',
          port: 8545,
        },
        objects: {
          CustomSimpleStore: {
            class: 'SimpleStore',
            from: 2, // a custom account
            gas: 2900000, // some custom gas
          },
          AnotherCustomSimpleStore: {
            class: 'SimpleStore',
            from: 1, // a custom account
            gas: 2900000, // some custom gas
          },
        },
      },
    },
  },
};
