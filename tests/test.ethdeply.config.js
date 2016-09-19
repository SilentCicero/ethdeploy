const contracts = require('./lib/classes.json');

module.exports = {
  output: {
    environment: 'testrpc',
  },
  entry: {
    testrpc: contracts,
  },
  module: function(deploy, contracts){
    deploy(contracts.SimpleStoreRegistry).then(function(simpleStoreRegistry){
      deploy(contracts.SimpleStoreFactory, simpleStoreRegistry.address);
      deploy(contracts.CustomSimpleStore);
      deploy(contracts.AnotherCustomSimpleStore);
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
