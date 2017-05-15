/**
 * Expands JSON output
 *
 * @method JSONMinifier
 * @param {String} output the final build file produced by ethdeploy
 * @return {String} parsedOutput parsed output
 */
function JSONMinifier() {
  const self = this;
  self.process = (output) => JSON.stringify(JSON.parse(output));
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
  self.process = (output) => JSON.stringify(JSON.parse(output), null, 2);
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
  self.process = (output) => {
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
  JSONFilter,
};
