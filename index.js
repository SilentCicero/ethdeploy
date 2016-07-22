// require chalk, web3, promise and file system services
const chalk = require('chalk');
const Web3 = require('web3');
const Promise = require('promise');
const fs = require('fs');
const serialize = require('serialize-javascript');

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
require('./utils/arrayIncludesPolyfill');

// the main deployer object
const deployer = function(deployerConfig, callback) {
  // handle undefined callback
  if (typeof callback !== 'function') {
    callback = function(e, r) {};
  }

  // constants
  const environmentSelector = deployerConfig.environment;
  const deployModule = deployerConfig.deploymentModule;
  const compiledClasses = deployerConfig.outputContracts;
  const providedOptions = deployerConfig.deploymentConfig;

  // check compiled classes object
  // fail loudly if it doesn't look right
  isCompiledClassesObject(compiledClasses);

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
    'defaultBuildProperties': ['from', 'gas', 'transactionHash', 'receipt'],
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

  // construct deploy function
  const deployFunction = function(){
    // make args a mutable array, build contract object from args and a contract factory
    const args = Array.prototype.slice.call(arguments);

    // check args provided
    if (args.length <= 0) {
      return throwError('You must provide at least one argument into the deploy function.');
    }

    // build contract object
    const contractObject = args[0];

    // check for contract object
    if (typeof contractObject !== 'object' || contractObject === null) {
      return throwError('A contract or object instance does not exist. Please select only set objects or compiled contracts.');
    }

    // construct contract factory, bytecode, and factory
    const contractInterface = JSON.parse(contractObject.interface);
    const contractBytecode = contractObject.bytecode;
    const contractFactory = web3.eth.contract(contractInterface);
    var params = [];

    // has params
    if(args.length > 1) {
      params = args.slice(1, args.length - 1);
    }

    // check web3 connectivity
    checkWeb3Connectivity(web3, environmentSelector);

    // create contract deployment promise
    const contractDeployPromise = new Promise(function(resolveDeployment, rejectDeployment) {
      // get web3 accounts
      web3.eth.getAccounts(function(accountsError, accountsResult) {
        // handle errors
        if(accountsError) {
          throwError(`Error while getting accounts from provider: ${accountsError}`);
        }

        // setup selected account and gas amounts
        var selectedAccount = handleAccountObject(options.defaultAccount, accountsResult);
        var selectedGasAmount = options.defaultGas;

        // select custom gas from object settings if available
        if (typeof contractObject.gas !== 'undefined') {
          selectedGasAmount = contractObject.gas;
        }

        // select custom account from object settings if available
        if (typeof contractObject.from !== 'undefined') {
          selectedAccount = handleAccountObject(contractObject.from, accountsResult);
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
            log(`Contract '${contractObject.name}' failed to deploy: ${contractError}`);
            return rejectDeployment(contractError);
          }

          // handle contract deployment result
          if (contractResult.address) {
            contractsDeployed += 1;

            // get the transaction recepit for the contract deployed
            web3.eth.getTransactionReceipt(contractResult.transactionHash, function(receiptError, receiptObject){
              if (receiptError) {
                return throwError(`Error while getting transaction receipt: ${receiptError}`);
              }

              // build new envionrments build object
              environmentsBuildObject = addContractToBuildObject(environmentsBuildObject, options.defaultBuildProperties, environmentSelector, contractObject.name, contractResult.address, contractInterface, contractBytecode, contractResult.transactionHash, selectedAccount, selectedGasAmount, receiptObject);

              // count all keys in object
              // this is slightly hacky, the count should be in a stats object
              const environmentObjectKeyCount = Object.keys(environmentsBuildObject[environmentSelector]).length;

              // write build file
              if (contractsDeployed >= contractsToBeDeployed && environmentObjectKeyCount == contractsToBeDeployed) {
                log(`All contracts deployed successfully to environment '${environmentSelector}'!`);
                callback(null, environmentsBuildObject);
              }
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

  // construct final contracts object
  const contractsObject = addContractNamesToClasses(addObjectsToClasses(compiledClasses, options.environments[environmentSelector].objects));

  // run deploy script
  deployModule(deployFunction, contractsObject, web3);
};

// export main deployer module
module.exports = deployer;
