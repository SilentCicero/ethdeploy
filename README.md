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

Once central purpose of this module is to deploy contracts which need to be deployed, and skip the deployment of contracts which have already been deployed with the same inputs and bytecode.

Note, this module is highly experimental and requires more testing and research before being using on the main network. Use at your own risk.

## Installation

```
npm install --save ethdeploy
```

## Example

Checkout the ethdeploy [example](/example/index.js) provided. This will deploy a bunch of contracts with an ethdeploy setup and config.

```
cd example
npm install
npm run example
```

## CLI

The CLI allows you to deploy an ethdeploy module from the command line. You can use this globally or loally.

```
ethdeploy ./ethdeploy.testnet.js

// or locally as:

node ./node_modules/ethdeploy/bin/ethdeploy.js ./ethdeploy.testnet.js
```

## Example Deployment Module

Here we have an example `ethdeploy` deployment configuration module.

```js
const HttpProvider = require('ethjs-provider-http');

module.exports = (options) => ({ // eslint-disable-line
  entry: [
    './environments.json',
    './src/tests/contracts',
  ],
  output: {
    path: './',
    filename: 'environments.json',
    safe: true,
  },
  module: {
    environment: {
      name: 'localtestnet',
      provider: new HttpProvider('http://localhost:8545'),
      defaultTxObject: {
        from: 1,
        gas: 3000001,
      },
    },
    preLoaders: [
      { test: /\.(json)$/, loader: 'ethdeploy-environment-loader' },
    ],
    loaders: [
      { test: /\.(sol)$/, loader: 'ethdeploy-solc-loader', optimize: 1 },
    ],
    deployment: (deploy, contracts, done) => {
      deploy(contracts.SimpleStore, { from: 0 }).then(() => {
        done();
      });
    },
  },
  plugins: [
    new options.plugins.JSONFilter(),
    new options.plugins.JSONMinifier(),
  ],
});
```

Here we have a simple configuraton loading in previous contract builds, and new contract data. The deployment module just deploys the single contract and fires the `done` method, which will then output the result in an `environments.json` file as specified by the `config` output. The `solc` loader loads new contract data from `.sol` files, while the `environments` loader processes data from `.json` files. The default environment states that account `1` should be used to deploy contracts, while in deployment, the developer state they want the `SimpleStore` contract to be deployed from account `0`.

This module will produce JSON like this:

```js
{
  "localtestnet": {
    "SimpleStore": {
      "bytecode": "0x...",
      "interface": "[{....}]",
      "address": "0x3a70a6765746af3bfa974fff9d753d4b6c56b333",
      "inputs": [],
      "transactionObject": {
        "from": "0x7f3e74e3dbb4091973ea1b449692c504c35ef768",
        "gas": 3000001
      }
    }
  }
}
```

## Config Module Description

Ethdeploy modules are `Object`s or `Funtion`s, much like webpack modules. You specify a single deployment environment per file. This includes the inputs, loaders, environment, deployment schedule and output. This follows in some way the webpack data processing flow, from entry, to output.

```js
module.exports = {
  entry: [],        // entry data, usually paths to files or directors
  output: {},       // output specifications, output file name etc
  module: {},       // the deployment configuration, environment, deployment schedule
  plugins: {},      // plugins that format output data, do special things
};
```

### Entry

The module entry is usually file or directory paths, but can actually be any kind of object. If you would like to use your own custom object, you can specify your own `module.sourceMapper` which will help produce a sourcemap of the entry for loaders to intake.

### Output

The output specifies information about the output file or object. Usually things like the output filename.

### Module

The module is where you specify all your deployment environment and schedule. This is where the action happens for `ethdeploy`.

### Plugins

Plugins help format the output which is usually JSON. It processes output data into a format that you want.

## Data Processing Flow

`ethdeploy` is designed to help load and deploy your Ethereum contracts, then output the data (in a file or object). The data process flow is at first glass complicated, but is designed for complete configuratbility of contract deployment of Ethereum contracts. Here is the `ethdeploy` data processing flow. In simple terms, `ethdeploy` intakes the configuration module, and should output a single data output/file.

Stages of processing:

  1. [source mapping of entry] : source map all entry data into a single output source map object
  2. [environment configuration] : configure environment (load accounts, set gas and defaults)
  3. [pre loader processing] : load all pre configured data such as previous builds/deployments
  4. [loader processing] : load all new data, like new contract bytecode or interfaces
  5. [deployment module processing] : run the module.deployment method, which will trigger the deployment process
  6. [output plugin processing] : run the specified output plugins if any
  7. [final data write/output] : write the final output object/data

## `ethdeploy` module

The `ethdeploy` module can be required and used in normal nodejs javascript contexts. `ethdeploy` should also be able to be used client-side in the browser, although this has not beed tested yet. Here is the `ethdeploy` using in a nodejs context. The module simply intakes the config file and returns a standard callback result.

```js
const ethdeploy = require('ethdeploy');
const deploymentConfig = require('ethdeploy.testrpc.config.js');

ethdeploy(deploymentConfig, (err, result) => {
  console.log(err, result);
});
```

## Loaders

Ethdeploy has a simple loader API that allows you to build or plugin existing loaders. There are two kinds of loaders, `preLoaders` and `loaders`. PreLoaders are for pre data change loading, such as loading in previous environments or deployment data. The loaders are for loading in new contract data like new build data from a recent solc build. The loader loads in a sourceMapped data object from the module sourcemapper, then spits out a environment JSON structure object.

Exmaple loader:

```js
/**
 * Loads an environments.json file, produced by ethdeploy
 *
 * @method loader
 * @param {Object} sourceMap the file source map
 * @param {Object} loaderConfig the config for the specified loader
 * @param {Object} environment the loaded environment object
 * @return {Object} contracts the output contracts object
 */
module.exports = function loader(sourceMap, loaderConfig, environment) { // eslint-disable-line
  // loader code
}
```

### Available Loaders:

Here are some available loaders. The `environment` and `solc` loaders are most likely the ones you would use the most (i.e. loading your previous deployments and your new contract builds).

  - `ethdeploy-environment-loader`: loads standard ethdeploy environment files (for loading previous deployments)
  - `ethdeploy-solc-loader`: compiles `.sol` Ethereum contracts for ethdeploy (for loading solc contract data)
  - `ethdeploy-solc-json-loader`: loads and processes solc-json files (the output from solc as a JSON)

### Loader Config

Ethdeploy loaders, much like webpack loaders, use regex to test if the sourcemap presented should be laoded by the required loader module. There are three regex properties you can use to select the correct files for your loader.

 - `test`: regex test must be positive to include in loader
 - `include`: regex test must be positive or null to include in loader
 - `exclude`: if specified, file path must be negative against this test to include in loader

Sometimes you want specific files to be excluded from specific loaders, like tests in final build and deployment. The `exclude` test is good for this, it allows you to do things like exclude Solidity test files from final build deployment.

## Plugins

Plugins help format the output data, they simple intake the data string (usually a JSON string) and format that data however the developer wants. The most used plugin is the JSON minifier plugin which just minifies the outputted JSON information. There is a default set of plugins which are fed in through the ethdeploy method options input. See the `example` for more details.

Here is the JSON Minifier plugin:

```js
/**
 * Minifies JSON output
 *
 * @method JSONMinifier
 * @param {String} output the final build file produced by ethdeploy
 * @return {String} parsedOutput parsed output
 */
function JSONMinifier() {
  const self = this;
  self.process = (output) => JSON.stringify(JSON.parse(output));
}
```

### Available Plugins

Here are some available plugins for `ethdeploy`. The main one will most likely be the `JSONMinifier` plugin, used to minify output JSON. Note, these plugins come with ethdeploy and are fed in through the options object of your deployment module (if you use a type `Function` module).

  - `JSONMinifier`: minifies output JSON from ethdeploy
  - `JSONExpander`: expands output JSON from ethdeploy
  - `JSONFilter`: filters the JSON output to `address`, `bytecode`, `interface`, `transactionObject` and `inputs` properties.

## Deployment Modules

The `ethdeploy` config allows you to specify your deployment in the `module` object. Within this module are a few critical configuration requirements. In your module you must specify a `environment`, and `deployment` function. Loaders should also be used to load in the entry data into the deployment module. The loaders will intake data loaded in from the source mapping stage, and output the final data to the `contracts` object used in `module.deployment`. The `deploy` method intakes the formatted contract data, compares it with what was loaded at the preLoaded stage, if there are different properties like `bytecode` or new contracts, it will deploy those, otherwise it will skip and return the exiting contract instance. Once the deployment module is done, the `done` method should be fired, to trigger the output processing.

Example:

```js
module: {
  environment: {
    name: 'localtestnet',
    provider: new HttpProvider('http://localhost:8545'),
    defaultTxObject: {
      from: 1,
      gas: 3000001,
    },
  },
  preLoaders: [
    { test: /\.(json)$/, loader: 'ethdeploy-environment-loader' },
  ],
  loaders: [
    { test: /\.(sol)$/, loader: 'ethdeploy-solc-loader', optimize: 1 },
  ],
  deployment: (deploy, contracts, done) => {
    deploy(contracts.SimpleStore, 'constructor argument 1', 'argument 2...', { from: 0 }).then(() => done());
  },
},
```

### environment

The environment specifies your deployment env. provider, name and default transaction object.

### preLoaders

The pre-loaders load all previous deployment information, such as previous contract builds or deployoments.

### loaders

The loaders load all current contract builds, such as new solc contracts or new contract bytecode.

### deployment

The deployment module is where the contract deployment schedule is specified. This is where the main action happens for contract deployment. The `deploy` method is used to deploy pre-formatted `contracts` data. Once the process is completed, the `done` method should be fired to complete the process.

## Deloyment Scheduling

Ethdeploy allows you to specify your own complex deployment schedule. The inputs provided to the deployment property are `deploy`, `contracts`, `done` and `environment`. The `deploy` method is used to deploy the contract object. The `contracts` object is fed in by the loaders, and is used by the `deploy` method to deploy the contracts. The `done` method should be fired at the end of deployment to stop the deployment process and begin the outputting process. The `environment` object is used for including environmental information into your schedule like accounts, balances and other things of this sort.

Basic Example:

```js
deployment: (deploy, contracts, done) => {
  deploy(contracts.SimpleStore).then(() => done());
},
```

Here we have a very basic deployment schedule. This will deploy contract SimpleStore with the `deploy` method. Then once the contract is deployed, the `done` method is fired.


Complex Example:

```js
deployment: (deploy, contracts, done) => {
  deploy(contracts.SimpleStore, 45, 'My Simple Store', { from: 0 })
  .then((contractInstance) => deploy(contracts.StandardToken, contractInstance.address))
  .then(done);
},
```

Here we have a more complex example. The first contract `SimpleStore` is being deployed with two constructor arguments, (1) the value `45` and (2) the String `'My Simple Store'`. Contract `SimpleStore` is being deployed from account `0`, as specified by the transaction object `{ from: 0 }`. Then once `SimpleStore` is deployed, the StandardToken contract is being deployed with a single constructor argument, the address of the newly deployed `SimpleStore` contract instance. Once the `StandardToken` contract is deployed, the `done` method is fired to end the deployment schedule.

This is a more complex deployment example, where one contract relies on the others address for deployment. Also note that if SimpleStore had beed deployed previously for example, the outputted environment was loaded back into `ethdeploy`, it would not be redeployed if all inputs are the same. The inputs to re-interate are: `address`, `transactionObject`, `bytecode`, `inputs` and `interface`. If any of these values had changed, then the `SimpleStore` contract would re-deploy, otherwise the contractInstance retured is simply that of the previously deployed contract.

## Environments Object (the output object)

`ethdeploy` will output your contracts either as an object within execution or to a file system, if used in the CLI. The final object output follows a very simple organizational pattern. Namely, envrionment, then contracts. A single environments output can contain multiple environments and multiple deployments of different contracts within each environment.

Example output:

```js
{
  "ropsten": {
    "SimpleStore": {
      "address": "0x..",
      "bytecode": "0x..",
      "interface": "[{}]",
    },
    "SimpleStoreFactory": {
      "address": "0x..",
      "bytecode": "0x..",
      "interface": "[{}]",
    }
  }
}
```

Above, we see that there is the environment ropsten and the subsequent contracts deployed to environment `ropsten`. From this object, you would either include or `require` the object into your dApp, where it can be used by the front end.

The common properties used by `ethdeploy` in the outputted environments JSON are:

  1. `address`             {String} the address of the deployed contract instance
  2. `transactionObject`   {Object} the transaction object used to deploy that contract instance
  3. `bytecode`            {String} the Ethereum virtual machine code (bytecode) of that contract instance
  4. `inputs`              {Array}  the inputs used to deploy that contract (with numbers formatted as hex base 16)
  5. `interface`           {String} the interface of the contract, specified as a JSON string

These properties are both outputed by ethdeploy and looked at by the default deployment method `deploy` when the deployment schedule is being used.

Other additional properties are:

  1. `receipt`             {Object} the transaction receipt data
  2. `assembly`            {Object} the contract assembly code

### License

This module is under The MIT License. Please see the `LICENCE` file for more details.
