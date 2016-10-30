const contracts = require('../tests/lib/classes.json');

module.exports = {
  output: {
    environment: 'testrpc',
    path: './example/environments.json',
  },
  entry: {
    testrpc: contracts,
  },
  module: function(deploy, contracts, environment){
    deploy(contracts.SomeCustomInstance);

    deploy(contracts.SimpleStoreRegistry).then(function(simpleStoreRegistry){
      deploy(contracts.SimpleStoreFactory, simpleStoreRegistry.address).then(function(factoryInstance){
        deploy(contracts.SomeOtherCustomInstance).then(function(contractInstance){
          environment.log('Yay!');
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
          SomeCustomInstance: {
            class: 'SimpleStore',
            from: 3, // a custom account
            gas: 2900000, // some custom gas
          },
          SomeOtherCustomInstance: {
            class: 'SimpleStore',
            from: 3, // a custom account
            gas: 2900000, // some custom gas
          },
        },
      },
    },
  },
  outputAsEntry: true,
};
