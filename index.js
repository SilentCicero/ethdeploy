// require chalk, web3, promise and file system services
const chalk = require('chalk');
const Web3 = require('web3');
const Promise = require('promise');
const fs = require('fs');
const serialize = require('serialize-javascript');
const bnToString = require('bignumber-to-string');
const arrayEquals = require('array-equal');

// custom utils and abstractions
const utils = require('./utils/index');
const throwError = utils.throwError;
const log = utils.log;
const addContractNamesToClasses = utils.addContractNamesToClasses;
const addContractToBuildObject = utils.addContractToBuildObject;
const buildProvider = utils.buildProvider;
const handleAccountObject = utils.handleAccountObject;
const stripComments = utils.stripComments;
const checkWeb3Connectivity = utils.checkWeb3Connectivity;
const addObjectsToClasses = utils.addObjectsToClasses;
const isCompiledClassesObject = utils.isCompiledClassesObject;
const assembleOutputEntryObject = utils.assembleOutputEntryObject;
require('./utils/arrayIncludesPolyfill');

// deployer function helper
const deployEnvironment = function(environmentSelector, deployerConfig, readOutput, callback) {
  // default the entry input
  var compiledClasses = deployerConfig.entry[environmentSelector];
  var outputEnvironment = null;

  // if readOutput
  if (readOutput !== null) {
    // override readoutput entry with entry input
    // this will move some properties onto know contracts
    compiledClasses = assembleOutputEntryObject(deployerConfig.entry[environmentSelector], readOutput[environmentSelector], deployerConfig.config.environments[environmentSelector]);
    outputEnvironment = readOutput[environmentSelector];
  }

  const deployModule = deployerConfig.module;
  const providedOptions = deployerConfig.config;

  // check compiled classes object
  // fail loudly if it doesn't look right
  // idenitfy good environment object
  // isCompiledClassesObject(compiledClasses);

  // check deployModule
  if (typeof environmentSelector !== "string") {
    throwError(`your environment selected should be a string... it is currently a '${typeof environmentSelector}'.`);
  }

  // check deployModule
  if (typeof providedOptions !== "object") {
    throwError(`your options object should be an object... it is currently a '${typeof providedOptions}'.`);
  }

  // check deployModule
  if (typeof deployModule !== "function") {
    throwError(`your deploy module should be a function... it is currently a '${typeof deployModule}'.`);
  }

  // dynamic variables
  var contractsDeployed = 0;
  var contractsToBeDeployed = 0;
  var environmentsBuildObject = {};

  // defaultOptions object
  const defaultOptions = {
    'defaultAccount': 0,
    'defaultGas': 3000000,
    'environments': {},
  };

  // select and build provider object, then a web3 instance
  // setup options object
  const options = Object.assign(defaultOptions, providedOptions);
  const providerObject = buildProvider(options.environments[environmentSelector].provider, Web3);
  const web3 = new Web3(providerObject);

  // log environment configured
  log(`Environment '${environmentSelector}' configured, starting contract deployment...`);

  // get web3 accounts
  web3.eth.getAccounts(function(accountsError, accountsResult) {
    // handle no accounts
    if (typeof accountsResult === 'undefined') {
      throwError(`Error, no accounts provided.`);
    }

    // handle no accounts
    if (accountsResult.length === 0) {
      throwError(`Error, no accounts provided.`);
    }

    // handle errors
    if (accountsError) {
      throwError(`Error while getting accounts from provider: ${accountsError}`);
    }

    // setup selected account and gas amounts
    var selectedAccount = handleAccountObject(options.defaultAccount, accountsResult);

    // default gas
    var defaultGas = options.defaultGas || 3000000;

    // default tx object
    const defaultTxObject = {gas: defaultGas, from: selectedAccount};

    // use done
    var useDone = false;

    // done method
    var doneMethod = function() {
      useDone = true;
      return function() {callback(null, environmentsBuildObject);};
    };

    // construct deploy function
    const deployFunction = function(){
      var params = [];
      var previousContractObject = null;

      // make args a mutable array, build contract object from args and a contract factory
      const args = Array.prototype.slice.call(arguments);

      // check args provided
      if (args.length <= 0) {
        return throwError('You must provide at least one argument into the deploy function.');
      }

      // build contract object
      const contractObject = args[0];

      // try and get previous contract object from output
      if (outputEnvironment !== null && outputEnvironment.hasOwnProperty(contractObject.name)) {
        previousContractObject = outputEnvironment[contractObject.name];
      }

      // check for contract object
      if (typeof contractObject !== 'object' || contractObject === null) {
        return throwError('A contract or object instance does not exist. Please select only set objects or compiled contracts.');
      }

      // construct contract factory, bytecode, and factory
      const contractInterface = JSON.parse(contractObject.interface);
      const contractBytecode = contractObject.bytecode;
      const contractFactory = web3.eth.contract(contractInterface);

      // has params
      if (args.length > 1) {
        params = args.slice(1, args.length);
      }

      // check web3 connectivity
      checkWeb3Connectivity(web3, environmentSelector);

      // create contract deployment promise
      const contractDeployPromise = new Promise(function(resolveDeployment, rejectDeployment) {
        var selectedGasAmount = options.defaultGas;

        // select custom gas from object settings if available
        if (typeof contractObject.gas !== 'undefined') {
          selectedGasAmount = contractObject.gas;
        }

        // select custom account from object settings if available
        if (typeof contractObject.from !== 'undefined') {
          selectedAccount = handleAccountObject(contractObject.from, accountsResult);
        }

        // copy the array params before adding calback
        const paramsInput = params.slice();

        // parse down the contract input params, if any, to keep consistent
        function parseInputParams(inputParams) {
          return bnToString(inputParams);
        }

        // check if this contract has already been deployed
        function contractIsAlreadyDeployed (presentContractObject, newContractObject) {
          if (presentContractObject !== null
            && presentContractObject.bytecode === newContractObject.bytecode
            && presentContractObject.interface === newContractObject.interface
            && presentContractObject.from === newContractObject.from
            && arrayEquals(presentContractObject.params, newContractObject.params)
            && presentContractObject.gas === newContractObject.gas) {

            return true;
          }

          return false;
        }

        // the build object that will become the output
        const contractBuildObject = {
          name: contractObject.name,
          address: contractObject.address,
          interface: JSON.stringify(contractInterface),
          bytecode: contractBytecode,
          from: selectedAccount,
          gas: selectedGasAmount,
          params: parseInputParams(paramsInput),
          receipt: null,
        };

        // check and resole final build output
        function checkAndResolveFinalBuildOutput() {
            // count all keys in object
            // this is slightly hacky, the count should be in a stats object
            var environmentObjectKeyCount = Object.keys(environmentsBuildObject[environmentSelector]).length;

            // write build file
            if (contractsDeployed >= contractsToBeDeployed
              && environmentObjectKeyCount == contractsToBeDeployed
              && useDone === false) {
              log(`All contracts deployed successfully to environment '${environmentSelector}'!`);
              callback(null, environmentsBuildObject);
            }
        }

        // check if the conract deployment promise should be resolved early
        // resolve the deployment early, because this contract has already been deployed
        // its gas, from, bytecode, params, name are all the same
        if (contractIsAlreadyDeployed(previousContractObject, contractBuildObject)) {
          log(`Contract '${contractObject.name}' already deployed to environment '${environmentSelector}' bypassing deployment with address '${contractObject.address}' `);

          // increase contracts deployed
          contractsDeployed += 1;

          // resolve deployment
          resolveDeployment(contractFactory.at(contractObject.address));

          environmentsBuildObject = addContractToBuildObject(environmentsBuildObject,
            ['from', 'gas', 'transactionHash', 'receipt', 'params'],
            environmentSelector,
            contractObject.name,
            previousContractObject.address,
            previousContractObject.interface,
            previousContractObject.bytecode,
            previousContractObject.transactionHash,
            previousContractObject.from,
            previousContractObject.gas,
            previousContractObject.receipt,
            previousContractObject.params);

          // check and resolve output
          return checkAndResolveFinalBuildOutput();
        } else {
          // check account balance amount
          web3.eth.getBalance(selectedAccount, function(getBalanceError, selectedAccountBalance){
            if (getBalanceError) {
              return throwError(`Error while getting account balance 'getBalance' of account ${selectedAccount}`);
            }

            // if the balance of the selected accont is less than the selected gas amount
            if (selectedAccountBalance.lessThan(selectedGasAmount)) {
              return throwError(`Account Out of Gas:

                The selected account '${selectedAccount}' does not have enough ether balance to pay for gas costs while deploying contract ${contractObject.name}

                Current Account Balance: ${selectedAccountBalance} wei
                Selected Gas Amount: ${selectedGasAmount} wei

                -------

                Please fill your selected account with enough ether to pay for the selected gas amount.
              `);
            }
          });
        }

        // add txObject
        params.push({
          from: selectedAccount,
          gas: selectedGasAmount,
          data: contractBytecode,
        });

        // add tx callback
        params.push(function(contractError, contractResult){
          // handle contract deployment error
          if (contractError) {
            log(`Contract '${contractObject.name}' failed to deploy: ${String(contractError)} -- ${JSON.stringify(contractError)}`);
            return rejectDeployment(contractError);
          }

          // handle transaction hash
          if (contractResult.transactionHash && !contractResult.address) {
            log(`Contract '${contractObject.name}' deploying with transaction hash: ${contractResult.transactionHash} `);
          }

          // handle contract deployment result
          if (contractResult.address) {
            contractsDeployed += 1;

            // get the transaction recepit for the contract deployed
            web3.eth.getTransactionReceipt(contractResult.transactionHash, function(receiptError, receiptObject){
              if (receiptError) {
                return throwError(`Error while getting transaction receipt: ${serialize(receiptError)}`);
              }

              // build new envionrments build object
              environmentsBuildObject = addContractToBuildObject(environmentsBuildObject,
                ['from', 'gas', 'transactionHash', 'receipt', 'params'],
                environmentSelector,
                contractObject.name,
                contractResult.address,
                JSON.stringify(contractInterface),
                contractBytecode,
                contractResult.transactionHash,
                selectedAccount,
                selectedGasAmount,
                receiptObject,
                paramsInput);

              checkAndResolveFinalBuildOutput();
            });

            // resolve deployment
            resolveDeployment(contractResult);
          }
        });

        // deploying ocntract message
        log(`Deploying '${contractObject.name}' to environment '${environmentSelector}'...`);

        // build new contract
        contractFactory.new.apply(contractFactory, params);
      });

      // return deployment promise for further async deployments
      return contractDeployPromise;
    };

    // serialize deploy script module function to count deploy
    const serializedDeployFunction = serialize(deployModule);

    // strip comments
    const fileData = stripComments(serializedDeployFunction);

    // deploy method used X timestamp
    contractsToBeDeployed = (fileData.match(/deploy\(/g) || []).length;

    // handle no objects default
    if (typeof options.environments[environmentSelector].objects === 'undefined') {
      options.environments[environmentSelector].objects = {};
    }

    // construct final contracts object
    const contractsObject = addContractNamesToClasses(addObjectsToClasses(compiledClasses, options.environments[environmentSelector].objects));

    // run deploy script
    deployModule(deployFunction, contractsObject, {doneMethod: doneMethod, web3: web3, log: log, defaultTxObject: defaultTxObject, accounts: accountsResult});
  });
};

// handle environments
const handleEnvironments = function(deployerConfig, environmentSelector, readOutput, callback) {
  // handle all
  if (environmentSelector == 'all') {
    var deployerOutputObject = {};
    var numEnvironmentsDeployed = 0;
    const environmentNames = Object.keys(deployerConfig.config.environments);

    // callback deployer output
    const combinerCallback = function(error, result){
      if (error) {
        return callback(error, null);
      } else {
        numEnvironmentsDeployed += 1;
        deployerOutputObject = Object.assign(deployerOutputObject, result);
      }

      if (environmentNames.length === numEnvironmentsDeployed) {
        callback(null, deployerOutputObject);
      }
    }

    environmentNames.forEach(function(environmentName){
      deployEnvironment(environmentName, deployerConfig, readOutput, combinerCallback);
    });
  } else {
    // deploy environment
    deployEnvironment(environmentSelector, deployerConfig, readOutput, callback);
  }
}

// the main deployer object
const deployer = function(deployerConfig, callback) {
  // handle undefined callback
  if (typeof callback !== 'function') {
    callback = function(e, r) {};
  }

  // constants
  const environmentSelector = deployerConfig.output.environment;

  // get environments JSON from path, if any exists, report if it doesn't
  if (typeof deployerConfig.output.path !== 'undefined'
      && deployerConfig.outputAsEntry === true) {
    fs.readFile(deployerConfig.output.path, 'utf8', function(readOutputError, readOutput) {
      // parse output object
      var outputObject = null;

      // handle output file error
      if (readOutputError) {
        log(`Error while reading output path as entry: ${readOutputError}`);
      }

      // handle bad JSON
      try {
        outputObject = JSON.parse(readOutput);
      } catch(outputJSONError) {
        log(`Error while parsing output JSON as entry: ${outputJSONError}..bypassing with empty object`);
      }

      // handle environments with output as entry and entry as override
      handleEnvironments(deployerConfig, environmentSelector, outputObject, callback);
    });
  } else {
    // handle environments with no output as entry input
    handleEnvironments(deployerConfig, environmentSelector, null, callback);
  }
};

// export main deployer module
module.exports = deployer;

console.log('loaded');
