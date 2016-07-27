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

## Input Description

Feed `ethdeploy` a deploy module, the compiled contracts and config object and it will deploy your contracts the way you want, where you want it and spit out a single object

  1. environment (the node or infrastructure you are deploying too)
  2. deploy script module (a simple, lightly abstracted build script module)
  3. contracts object (usually the output of the solc compiler [i.e. the `output.contracts`])
  4. config object (a vanilla object that usually resides in the package.json file under `ethdeploy`);

## Example Input Object

```js
module.exports = {
  environment: 'testrpc',
  deploymentModule: function(deploy, contracts){
    deploy(contracts.SimpleStore).then(function(simpleStoreInstance){
      deploy(contracts.SimpleStoreService, simpleStoreInstance.address).then(function(){
        console.log('Yay!');
      });

      deploy(contracts.SomeCustomInstance);
    });
  },
  deploymentConfig: {
    'defaultBuildProperties': ['from', 'transactionHash', 'gas'],
    'defaultAccount': 0,
    'defaultGas': 3000000,
    'environments': {
      'testrpc': {
        'provider': {
          'type': 'http',
          'host': 'http://localhost',
          'port': 8545,
        },
        'objects': {
          'SomeCustomInstance': {
            'class': 'SimpleStore',  // the contract/lib that is selects
            'from': 3,               // a custom account
            'gas': 2900000,          // some custom gas
          },
        },
      },
    },
  },
  outputContracts: {
    SimpleStore:
   { bytecode: '6060604052603b8060106000396000f3606060405260e060020a600035046360fe47b1811460245780636d4ce63c14602e575b005b6004356000556022565b6000546060908152602090f3',
     functionHashes: { 'get()': '6d4ce63c', 'set(uint256)': '60fe47b1' },
     interface: '[{"constant":false,"inputs":[{"name":"_value","type":"uint256"}],"name":"set","outputs":[],"type":"function"},{"constant":false,"inputs":[],"name":"get","outputs":[{"name":"","type":"uint256"}],"type":"function"}]\n',
     opcodes: 'PUSH1 0x60 PUSH1 0x40 MSTORE PUSH1 0x3B DUP1 PUSH1 0x10 PUSH1 0x0 CODECOPY PUSH1 0x0 RETURN PUSH1 0x60 PUSH1 0x40 MSTORE PUSH1 0xE0 PUSH1 0x2 EXP PUSH1 0x0 CALLDATALOAD DIV PUSH4 0x60FE47B1 DUP2 EQ PUSH1 0x24 JUMPI DUP1 PUSH4 0x6D4CE63C EQ PUSH1 0x2E JUMPI JUMPDEST STOP JUMPDEST PUSH1 0x4 CALLDATALOAD PUSH1 0x0 SSTORE PUSH1 0x22 JUMP JUMPDEST PUSH1 0x0 SLOAD PUSH1 0x60 SWAP1 DUP2 MSTORE PUSH1 0x20 SWAP1 RETURN ',
     runtimeBytecode: '606060405260e060020a600035046360fe47b1811460245780636d4ce63c14602e575b005b6004356000556022565b6000546060908152602090f3',
     solidity_interface: 'contract SimpleStore{function set(uint256 _value);function get()returns(uint256 );}' },
  SimpleStoreService:
   { bytecode: '6060604052604051602080608f83395060806040525160008054600160a060020a03191682178082557f60fe47b1000000000000000000000000000000000000000000000000000000006080908152602d608452600160a060020a0391909116916360fe47b19160a4919060248183876161da5a03f1156002575050505060068060896000396000f3606060405200',
     functionHashes: {},
     interface: '[{"inputs":[{"name":"_simpleStore","type":"address"}],"type":"constructor"}]\n',
     opcodes: 'PUSH1 0x60 PUSH1 0x40 MSTORE PUSH1 0x40 MLOAD PUSH1 0x20 DUP1 PUSH1 0x8F DUP4 CODECOPY POP PUSH1 0x80 PUSH1 0x40 MSTORE MLOAD PUSH1 0x0 DUP1 SLOAD PUSH1 0x1 PUSH1 0xA0 PUSH1 0x2 EXP SUB NOT AND DUP3 OR DUP1 DUP3 SSTORE PUSH32 0x60FE47B100000000000000000000000000000000000000000000000000000000 PUSH1 0x80 SWAP1 DUP2 MSTORE PUSH1 0x2D PUSH1 0x84 MSTORE PUSH1 0x1 PUSH1 0xA0 PUSH1 0x2 EXP SUB SWAP2 SWAP1 SWAP2 AND SWAP2 PUSH4 0x60FE47B1 SWAP2 PUSH1 0xA4 SWAP2 SWAP1 PUSH1 0x24 DUP2 DUP4 DUP8 PUSH2 0x61DA GAS SUB CALL ISZERO PUSH1 0x2 JUMPI POP POP POP POP PUSH1 0x6 DUP1 PUSH1 0x89 PUSH1 0x0 CODECOPY PUSH1 0x0 RETURN PUSH1 0x60 PUSH1 0x40 MSTORE STOP ',
     runtimeBytecode: '606060405200',
     solidity_interface: 'contract SimpleStoreService{function SimpleStoreService(address _simpleStore);}' }
   },
};
```

## Example Output Object

This is an example object generated by ethdeploy. The object describes each environment and their relevant contracts. The core property of each contract instance deployed is the address property, everything else is optionally configured.

```json
{
  "testrpc": {
    "SimpleStore": {
      "address": "0x179895ccb2a149d07ecab8ff50c57fca808c32c4",
      "gas": 3000000,
      "from": "0xcd8175afaec49803b22cae09879ea38feeb892bb",
      "transactionHash": "0x03d28dd1fcd322b221b00b48aaf60627b7854478e28297843b52848aa7f9d239"
    },
    "SomeCustomInstance": {
      "address": "0x6bfb8dcf73157c2003b3ad33c3253f92df5156b6",
      "gas": 2900000,
      "from": "0x8ea1c64b7ecca5a850d4d37841b65d2fef1c212b",
      "transactionHash": "0x8818179302adb0be04823eb367abc676e1a88358f2ca137687244661952d19f9"
    }
  }
}
```

## Ethdeploy Provider Module System

ethdeploy allows you to build your own provider modules. At this point, ethdeploy provider modules must be prefixed in a specific way. If your provider `type` is specified as "http" for example, the npm module "ethdeploy-provider-http" must be installed, as it will be `require`d and used in the deployment staging. Note, this provider module naming convention will be less opinionated in the future.

The provider module API is as follows:

```js
module.exports = function(providerObject) {
  return // Your web3 provider object
}
```

Here, `providerObject` is simply the object specified in the ethdeploy environment config, for example:

```js
'provider': {
  'type': 'http',
  'host': 'http://localhost',
  'port': 8545,
},
```

Where the provider `type` property is actually specifying the provider module (e.g. `http` => `ethdeploy-provider-http`). This design pattern is once again similar to the `webpack` loader system.

## Providers
 - [ethdeploy-provider-http](http://github.com/ethdeploy-provider-http)

## Future Todo/Design Considerations
 - Don't use promises by default for deployment staging (allow users to make plugins for this)
 - Enable pre-loader and post-loader staging for contract deployment
 - Enable promisified or sync classes object return
 - Multiple environment selection (select multiple environments to deploy too)
 - Great unit tests ;)
 - Make configuration more awesome (the current intake input is cool, but could be far more configurable)
 - Make provider module naming conventions/requirements less opinionated

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
