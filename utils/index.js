const chalk = require('chalk');

// throw abstraction for more control
const throwError = function(error) {
  throw `ethdeploy [${(new Date()).toISOString()}] ERROR: ${chalk.red(error)}`;
};

// log abstraction for more control
const log = function() {
  const args = Array.prototype.slice.call(arguments);

  // output console log
  console.log.apply(console.log, [`ethdeploy [${(new Date()).toISOString()}]: `].concat(args));
};

// add contract names to classes object
// this is for keeping track of contracts as they get used and build
// with the deploy script
const addContractNamesToClasses = function(classes) {
  const classesObjectWithNames = Object.assign({}, classes);

  // assign child property `name` to all classes in JSON made from solc output
  Object.keys(classes).forEach(function(className){
    classesObjectWithNames[className].name = className;
  });

  // return classes object with names
  return classesObjectWithNames;
};

// immutable object return
// adds the latest deployed contract to the end output build object
const addContractToBuildObject = function(buildObject, buildProperties, provider, contractName, contractAddress, contractInterface, contractBytecode, transactionHash, accountUsed, gasAmountUsed, receiptObject) {
  if (typeof buildObject[provider] === 'undefined') {
    buildObject[provider] = {};
  }

  // assemble the basic contract build object
  buildObject[provider][contractName] = {
    'address': contractAddress,
  };

  // handle build properties string
  if (typeof buildProperties === 'string') {
    buildProperties = buildProperties.split(',').map(Function.prototype.call, String.prototype.trim);
  }

  // include gas
  if(buildProperties.includes('gas')) {
    buildObject[provider][contractName].gas = gasAmountUsed;
  }

  // include contract bytecode
  if(buildProperties.includes('bytecode')) {
    buildObject[provider][contractName].bytecode = contractBytecode;
  }

  // include contract interface
  if(buildProperties.includes('interface')) {
    buildObject[provider][contractName].interface = contractInterface;
  }

  // include from
  if(buildProperties.includes('from')) {
    buildObject[provider][contractName].from = accountUsed;
  }

  // include transactionHash
  if(buildProperties.includes('transactionHash')) {
    buildObject[provider][contractName].transactionHash = transactionHash;
  }

  // include receipt
  if(buildProperties.includes('receipt')) {
    buildObject[provider][contractName].receipt = receiptObject;
  }

  return buildObject;
};

// build provider object for web3
const buildProvider = function(providerObject, web3Instance) {
  try {
    const ethdeployHTTPProvider = require(`ethdeploy-provider-${providerObject.type}`);

    return ethdeployHTTPProvider(providerObject);
  } catch(buildProviderError) {
    throwError(`Provider error ${buildProviderError} not supported..`);
  }
};

// handle account object (number or string)
// if number, select from web3.eth.getAccounts
const handleAccountObject = function(accountObject, accounts) {
  // if default account is set
  if (typeof accountObject === 'number') {
    return accounts[accountObject];
  } else if (typeof accountObject === 'string') {
    return accountObject;
  } else {
    throwError(`Account Error: account object ${JSON.stringify(accountObject)} cannot be anything but a string or number`);
  }
};

// remove all JS comments
// used for removing all comments in deploy script
// for a little code anylysis
const stripComments = function(dataString) {
  return String(dataString).replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, '');
};

// check web3 connectivity
const checkWeb3Connectivity = function(web3Instance, environmentSelector) {
  // check web3 connection, fail loudly
  if (web3Instance.currentProvider.hasOwnProperty('isConnected')) {
    if (!web3Instance.isConnected()) {
      throwError(`selected web3 provider '${environmentSelector}' is not connected! Please make sure your node is running and the necessary RPC ports are open before running ethdeploy...`);
      return;
    }
  } else {
    web3Instance.eth.getGasPrice(function(error, result){
      if (error && !result) {
        throwError(`selected web3 provider '${environmentSelector}' is not connected! Please make sure your node is running and the necessary RPC ports are open before running ethdeploy...`);
        return;
      }
    });
  }
};

// add objects into classes object
const addObjectsToClasses = function(classes, objects) {
  const classesObject = Object.assign({}, classes);

  Object.keys(objects).forEach(function(objectName) {
    const selectedObject = objects[objectName];

    // class object
    classesObject[objectName] = Object.assign({}, classes[selectedObject.class]);

    // add gas from selected object to the classes object
    if (typeof selectedObject.gas !== 'undefined') {
      classesObject[objectName].gas = selectedObject.gas;
    }

    // add from account from selected object to the classes object
    if (typeof selectedObject.from !== 'undefined') {
      classesObject[objectName].from = selectedObject.from;
    }
  });

  // return new object, without mutation
  return classesObject;
};

// is the object a compiled classes object
const isCompiledClassesObject = function(compiledClasses) {
  // check type
  if (typeof compiledClasses !== 'object') {
    throwError(`Compiled classes object must be an object, not anything else!`);
  }

  // check contracts available
  if (Object.keys(compiledClasses).length === 0) {
    throwError(`You must have some compiled contracts or classes in your compiled contracts classes object.`);
  }

  // check first contract for some basics
  if (compiledClasses[Object.keys(compiledClasses)[0]].hasOwnProperty('bytecode') === false) {
    throwError('Your contract compiled classes object does not look like a normal solc compiled classes object! Your classes should contain a "bytecode" property.');
  }

  // check first contract for some basics
  if (compiledClasses[Object.keys(compiledClasses)[0]].hasOwnProperty('interface') === false) {
    throwError('Your contract compiled classes object does not look like a normal solc compiled classes object! Your classes should contain a "interface" property.');
  }
};

// export utils
module.exports = {
  'addContractNamesToClasses': addContractNamesToClasses,
  'throwError': throwError,
  'log': log,
  'addContractToBuildObject': addContractToBuildObject,
  'buildProvider': buildProvider,
  'handleAccountObject': handleAccountObject,
  'stripComments': stripComments,
  'checkWeb3Connectivity': checkWeb3Connectivity,
  'addObjectsToClasses': addObjectsToClasses,
  'isCompiledClassesObject': isCompiledClassesObject,
};
