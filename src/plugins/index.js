/**
 * Expands JSON output
 *
 * @method JSONMinifier
 * @param {String} output the final build file produced by ethdeploy
 * @return {String} parsedOutput parsed output
 */
function JSONMinifier() {
  const self = this;
  self.process = ({ output }) => JSON.stringify(JSON.parse(output));
}

/**
 * Minifies JSON output
 *
 * @method JSONMinifier
 * @param {String} output the final build file produced by ethdeploy
 * @return {String} parsedOutput parsed output
 */
function JSONExpander() {
  const self = this;
  self.process = ({ output }) => JSON.stringify(JSON.parse(output), null, 2);
}

// a basic util filter function
function keyFilter(obj, predicate) {
  var result = {}, key; // eslint-disable-line

  for (key in obj) { // eslint-disable-line
    if (obj[key] && predicate(key)) {
      result[key] = obj[key];
    }
  }

  return result;
}

/**
 * This wil include contracts data in the environments output
 *
 * @method IncludeContracts
 * @param {Array} contractsSelector contracts to include in a contracts property
 * @param {Array} propertyFilter if fiter is not truthy, then ignore filtering
 * @param {String} environmentName environment name is usually contracts
 * @return {String} parsedOutput parsed output
 */
function IncludeContracts(
  contractsSelector,
  propertyFilter = ['interface', 'bytecode'],
  environmentName = 'contracts') {
  const self = this;
  self.process = ({ output, contracts }) => {
    // parse output
    const parsedOutput = JSON.parse(output);

    // add contracts environment
    parsedOutput[environmentName] = Object.assign({});

    // go through selected contracts
    contractsSelector.forEach((contractName) => {
      // if the contracts object has the selectedcontract
      // include it
      if ((contracts || {})[contractName]) {
        const contractObject = Object.assign({}, contracts[contractName]);

        // include contract data in environments output with property filter
        parsedOutput[environmentName][contractName] = propertyFilter ? keyFilter(contractObject, (key => propertyFilter.indexOf(key) !== -1)) : contractObject;
      }
    });

    return JSON.stringify(parsedOutput);
  };
}

/**
 * JSONFilter
 *
 * @method JSONFilter
 * @param {String} output the final build file produced by ethdeploy
 * @return {String} parsedOutput parsed output
 */
function JSONFilter(contractProperties = ['address', 'interface', 'bytecode', 'transactionObject', 'inputs']) {
  const self = this;
  self.process = ({ output }) => {
    const jsonObject = JSON.parse(output);
    const outputObject = Object.assign({});

    Object.keys(jsonObject).forEach((environmentName) => {
      outputObject[environmentName] = Object.assign({});

      Object.keys(jsonObject[environmentName]).forEach((contractName) => {
        outputObject[environmentName][contractName] = Object.assign({});

        Object.keys(jsonObject[environmentName][contractName]).forEach((contactProperty) => {
          if (contractProperties.indexOf(contactProperty) !== -1) {
            outputObject[environmentName][contractName][contactProperty] = jsonObject[environmentName][contractName][contactProperty];
          }
        });
      });
    });

    return JSON.stringify(outputObject);
  };
}

// export plugins
module.exports = {
  JSONMinifier,
  JSONExpander,
  IncludeContracts,
  JSONFilter,
};
