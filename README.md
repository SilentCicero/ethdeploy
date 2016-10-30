<img src="https://github.com/SilentCicero/ethdeploy/blob/master/ethdeploy-logo.png" width="500">

## ethdeploy | webpack for smart-contracts ;)

A first pass at a highly configurable contract staging and deployment utility.

Made with ❤︎ by Nick Dodson. If you're using this tool, we'd love to hear from you!

## Features
  - Highly unopinionated
  - Just deployment, that's it! (does not compile or tests contracts, but plugins though ;=D)
  - Composable, to be integrated into other things like `webpack` loaders, the `cli` or any other frameworks
  - Extremely configurable (deploy contracts with different settings to multiple environments in different ways)
  - Extensible, deployment staging can happen in any environment to any environment
  - Lightly abstracted, promisified but mostly unopinionated deployment scripting (maybe no promises in the future though)
  - Lightweight, does not include a ton of dependencies
  - Simple and robust, intakes data/config >> outputs result data
  - Is meant to aid in contract deployment, not dictate entire application design

## About

Deploy your Ethereum smart-contracts to multiple environments, with a range of configurations, using lightly abstracted promisified deployment staging modules. The end result is an environments object, that contains all configured contract information (e.g. address, receipt, gas, abi, etc.) for each selected environment and their contracts.

## Installation

```
npm install --save ethdeploy
```

## Example

Checkout the ethdeploy [example](/example/index.js) provided. Run a [testrpc](http://github.com/ethereumjs/ethereumjs-testrpc) instance, then run the example npm command `npm run example`. This will deploy a bunch of contracts with an ethdeploy setup and config.

```
testrpc
npm run example
```

## CLI

The CLI allows you to deploy an ethdeploy module from the command line. You can use this globally or loally.

```
ethdeploy ./ethdeploy.testnet.js

// or locally as:

node ./node_modules/ethdeploy/bin/main.js ./ethdeploy.testnet.js
```

## Input Description

Feed `ethdeploy` a deploy module, the compiled contracts and config object and it will deploy your contracts the way you want, where you want it and spit out a single object

  1. `output` the output environmnet, and JSON location
  2. `entry` the entry environment object, this can also be a collection of compiled contract information
  3. `module` the deployment schedule "how the contracts will be deployed"
  4. `config` how the environment configuration

## Example Input Object

```js
// in this case, the classes.json is from a `dapple build` result
const contracts = require('./lib/classes.json');

module.exports = {
  output: {
    environment: 'testrpc',
    path: './build/environments.json',
  },
  entry: {
    testrpc: contracts, // containing {contract: {bytecode: ..., interface: ...}}
  },
  module: function(deploy, contracts, environment){
    /*
    environment:
    {
      doneMethod : function  ...fire if you want the deployment module to stop"
      web3 : object ...the web3 object instance used during the deployment of that environment
      log : function ...a built in log function, use to log through the ethdeploy console
      defaultTxObject : function  ...a generalized transaction object with { gas, from } specified
      accounts : array ...all the available web3 accounts
    }
    */

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
```

## Example Output JSON

This is the example output JSON. The output notates all the contract information, deployment receipt information and any paramater data that was entered. This simplifies all data, so we know exactly all contract inputs and outputs.

```json
{
  "testnet": {
    "OpenRules": {
      "address": "0xd8afb4ea770326de3a7bad543298cc57dc8d8ba8",
      "gas": 3000000,
      "params": [],
      "bytecode": "6060604052610275806100126000396000f360606040526000357c01000000000000000000000000000000000000000000000000000000009004806319eb8d481461005a57806342b4632e1461009157806360dddfb1146100bf57806375eeadc3146100f457610058565b005b6100796004808035906020019091",
      "interface": "[{\"constant\":true,\"inputs\":[{\"name\":\"_sender\",\"type\":\"address\"},{\"name\":\"_proposalID\",\"type\":\"uint256\"}],\"name\":\"canVote\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"_sender\",\"type\":\"address\"}],\"name\":\"canPropose\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"_sender\",\"type\":\"address\"},{\"name\":\"_proposalID\",\"type\":\"uint256\"}],\"name\":\"votingWeightOf\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"_proposalID\",\"type\":\"uint256\"}],\"name\":\"hasWon\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"type\":\"function\"}]",
      "from": "0xe4660fdab2d6bd8b50c029ec79e244d132c3bc2b",
      "transactionHash": "0x3c42658bc9c6e926a367bbec5c685af8f79fd9f233ffc1cf546f71af5313c450",
      "receipt": {
        "blockHash": "0xd62e93a24b0d3fd555146f415df6ce7639a464ac345c74e4b0232b37bce71571",
        "blockNumber": 1772977,
        "contractAddress": "0xd8afb4ea770326de3a7bad543298cc57dc8d8ba8",
        "cumulativeGasUsed": 215967,
        "gasUsed": 215967,
        "logs": [],
        "transactionHash": "0x3c42658bc9c6e926a367bbec5c685af8f79fd9f233ffc1cf546f71af5313c450",
        "transactionIndex": 0
      }
    },
    "BoardRoom": {
      "address": "0xde49daec21ca54c5cd941f7ac1ee97869675f799",
      "gas": 3000000,
      "params": [
        "0xd8afb4ea770326de3a7bad543298cc57dc8d8ba8"
      ],
      "bytecode": "606060405260405160208061150a833981016040528080519060200190919050505b80600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908302179055505b506114ae8061005c6000396000f3606060405236156100c1576000357c010000000000000000000000000000000000000000000000000000000090048063013cf08b146100c3578063400e3949146101d457806343859632146101f7",
      "interface": "[{\"constant\":true,\"inputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"name\":\"proposals\",\"outputs\":[{\"name\":\"name\",\"type\":\"string\"},{\"name\":\"destination\",\"type\":\"address\"},{\"name\":\"proxy\",\"type\":\"address\"},{\"name\":\"value\",\"type\":\"uint256\"},{\"name\":\"hash\",\"type\":\"bytes32\"},{\"name\":\"executed\",\"type\":\"bool\"},{\"name\":\"debatePeriod\",\"type\":\"uint256\"},{\"name\":\"created\",\"type\":\"uint256\"}],\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"numProposals\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"_proposalID\",\"type\":\"uint256\"},{\"name\":\"_voter\",\"type\":\"address\"}],\"name\":\"hasVoted\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"_proposalID\",\"type\":\"uint256\"},{\"name\":\"_voter\",\"type\":\"address\"}],\"name\":\"voteOf\",\"outputs\":[{\"name\":\"position\",\"type\":\"uint256\"},{\"name\":\"weight\",\"type\":\"uint256\"},{\"name\":\"created\",\"type\":\"uint256\"}],\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"rules\",\"outputs\":[{\"name\":\"\",\"type\":\"address\"}],\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"_proposalID\",\"type\":\"uint256\"},{\"name\":\"_calldata\",\"type\":\"bytes\"}],\"name\":\"execute\",\"outputs\":[],\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"_proposalID\",\"type\":\"uint256\"},{\"name\":\"_position\",\"type\":\"uint256\"}],\"name\":\"positionWeightOf\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"_destination\",\"type\":\"address\"}],\"name\":\"destructSelf\",\"outputs\":[],\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"_proposalID\",\"type\":\"uint256\"},{\"name\":\"_voteID\",\"type\":\"uint256\"}],\"name\":\"voterAddressOf\",\"outputs\":[{\"name\":\"\",\"type\":\"address\"}],\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"_proposalID\",\"type\":\"uint256\"}],\"name\":\"numVoters\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"_proposalID\",\"type\":\"uint256\"},{\"name\":\"_position\",\"type\":\"uint256\"}],\"name\":\"vote\",\"outputs\":[{\"name\":\"voterWeight\",\"type\":\"uint256\"}],\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"_rules\",\"type\":\"address\"}],\"name\":\"changeRules\",\"outputs\":[],\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"_name\",\"type\":\"string\"},{\"name\":\"_proxy\",\"type\":\"address\"},{\"name\":\"_debatePeriod\",\"type\":\"uint256\"},{\"name\":\"_destination\",\"type\":\"address\"},{\"name\":\"_value\",\"type\":\"uint256\"},{\"name\":\"_calldata\",\"type\":\"bytes\"}],\"name\":\"newProposal\",\"outputs\":[{\"name\":\"proposalID\",\"type\":\"uint256\"}],\"type\":\"function\"},{\"inputs\":[{\"name\":\"_rules\",\"type\":\"address\"}],\"type\":\"constructor\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"name\":\"_proposalID\",\"type\":\"uint256\"},{\"indexed\":false,\"name\":\"_destination\",\"type\":\"address\"},{\"indexed\":false,\"name\":\"_value\",\"type\":\"uint256\"}],\"name\":\"ProposalCreated\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"name\":\"_proposalID\",\"type\":\"uint256\"},{\"indexed\":false,\"name\":\"_position\",\"type\":\"uint256\"},{\"indexed\":false,\"name\":\"_voter\",\"type\":\"address\"}],\"name\":\"VoteCounted\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"name\":\"_proposalID\",\"type\":\"uint256\"},{\"indexed\":false,\"name\":\"_sender\",\"type\":\"address\"}],\"name\":\"ProposalExecuted\",\"type\":\"event\"}]",
      "from": "0xe4660fdab2d6bd8b50c029ec79e244d132c3bc2b",
      "transactionHash": "0x863c12d0c2efe021fef8f30770cbc39859089b2e67d61258c1721cce90826517",
      "receipt": {
        "blockHash": "0x098ed2db2c63b3f75de6bb7ce74273c093159122a8da477efb46f487f06c5c02",
        "blockNumber": 1772980,
        "contractAddress": "0xde49daec21ca54c5cd941f7ac1ee97869675f799",
        "cumulativeGasUsed": 1492722,
        "gasUsed": 1471722,
        "logs": [],
        "transactionHash": "0x863c12d0c2efe021fef8f30770cbc39859089b2e67d61258c1721cce90826517",
        "transactionIndex": 1
      }
    }
  }
}
```

## Redeployment Staging

ethdeploy will not redeploy a contract if the entry input data is equal to the input data specified in the module. This means, if the contract `params`, `from` address, `bytecode`, `gas` and `interface` properties are the same as the new module input data, the contract will not be redeployed. Instead a contract instance will be used at the previsouly deployed contract address, with the specified interface. This way, if you have contracts in a deployment chain and some have the same inputs, they will not be redeployed, however, the complex deployment staging module will still continue as if they were deployed.

Example:
```
  module: function(deploy, contracts, environment){
    deploy(contracts.SimpleStore).then(function(simpleStoreInstance){
      deploy(contracts.SimpleStoreService, simpleStoreInstance.address).then(function(){
        environment.log('Yay!');
      });
    });
  },
  ...
```

In this example, if the `SimpleStore` contract bytecode where to change, then both the `SimpleStore` and `SimpleStoreService` contracts would have to be redeployed. Because the `bytecode` input has changed from the previous deployment, and so both contracts will be deployed.

However, if the `SimpleStoreService` contract `bytecode` were to change, only the `SimpleStoreService` contract would need to be redeployed, as the input of the `SimpleStore` contract has not changed, and will be subsequently bypassed and `simpleStoreInstance` would just return an instance of the already deployed `SimpleStore` contract.

## Ethdeploy Output As Entry Option

ethdeploy has a single prominent feature (to be replaced eventually by a plugin or loader) which is the `outputAsEntry` option. By setting `outputAsEntry` to `true` in your config module, ethdeploy will read your `output.path` module (if any), and use this as the base `entry` on which the specified `entry` module will `Object.assign` too. Note, this cleaver feature is a work around for now, while better plugin and loader systems are designed for ethdeploy. The main use for this feature is to enable a raw contract data input flow from your build staging (e.g. `solc`, `dapple`, `truffle` etc..), and a consideration of previously deployed contracts from your `environments.json`. The `outputAsEntry` option must be explicitly set to true in order to be used.

See: `examples/ethdeloy.outputAsEntry.config.js` for more details.

## Client-Side Support

The ethdeploy module can be used completely on the client-side. This allows you to orchestrate complex contract deployment on the client-side. Check the `examples/index.html` file for more details. Be sure to run a `TestRPC` instance before running the `index.html` file in your browser.

If you want to use ethdeploy in the browser, make sure to remove the `output.path` from your config modules `output`. You must also specify your provider modules by hand, by specifying the `provider.module` property. See: `examples/index.html` for more details on client-side configuration.

If you include the `dist/ethdeploy.js` module, along with the necessary provider modules, you can acces the `ethdeploy` module by using `window.ethdeploy` (and `window.ethdeployProviderHTTP` etc.).

To browserify ethdeploy, simply run:
```
npm run browserify
```

All client-side modules can be found in the `dist` directory.

Note, more explicit `clientSide` property specifiers may be required in the future.

## Ethdeploy Provider Module System

ethdeploy allows you to build your own provider modules. At this point, ethdeploy provider modules must be prefixed in a specific way. If your provider `type` is specified as "http" for example, the npm module "ethdeploy-provider-http" must be installed, as it will be `require`d and used in the deployment staging. Note, this provider module naming convention will be less opinionated in the future.

The provider module API is as follows:

```js
module.exports = function(providerObject) {
  return // Your web3 provider object
}
```

Here, `providerObject` is simply the object specified in the ethdeploy environment config, here is a standard web3 HTTP provider for example:

```js
'provider': {
  'type': 'http',
  'host': 'http://localhost',
  'port': 8545,
},
```

Where the provider `type` property is actually specifying the provider module (e.g. `http` => `ethdeploy-provider-http`). This design pattern is once again similar to the `webpack` loader system.

## Environment Selection
You can either deploy to "all" or a specific environment by setting the `environment` property.

```
environment: 'testrpc',
```

## Providers
 - [ethdeploy-provider-http](http://github.com/silentcicero/ethdeploy-provider-http)
 - [ethdeploy-provider-zero-client](http://github.com/silentcicero/ethdeploy-provider-zero-client)

## Future Todo/Design Considerations
 - Don't use promises by default for deployment staging (allow users to make plugins for this)
 - Enable pre-loader and post-loader staging for contract deployment
 - Enable promisified or sync classes object return
 - Great unit tests ;)
 - Make configuration more awesome (the current intake input is cool, but could be far more configurable)
 - Make provider module naming conventions/requirements less opinionated

## Deploying To Testnet/Livenet
 You can now easily deploy contracts off ethdeploy using the [ethdeploy-provider-zero-client](http://github.com/ethdeploy-provider-zero-client). See the `example/ethdeploy-zero-client.config.js` for more configuration details.

## Design Philosophy
 - Unix Philosophy
 - Webpack like (hard to setup, awesome when it's working =D)

## Things We Would Like To Use and Be Compatible With `ethdeploy`
  - Truffle
  - Dapple
  - Embark
  - Any other frameworks..

## Licence

Released under the MIT License, see [LICENSE.md](LICENSE.md) file.
