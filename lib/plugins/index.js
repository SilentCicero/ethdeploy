'use strict';

/**
 * Expands JSON output
 *
 * @method JSONMinifier
 * @param {String} output the final build file produced by ethdeploy
 * @return {String} parsedOutput parsed output
 */
function JSONMinifier() {
  var self = this;
  self.process = function (output) {
    return JSON.stringify(JSON.parse(output));
  };
}

/**
 * Minifies JSON output
 *
 * @method JSONMinifier
 * @param {String} output the final build file produced by ethdeploy
 * @return {String} parsedOutput parsed output
 */
function JSONExpander() {
  var self = this;
  self.process = function (output) {
    return JSON.stringify(JSON.parse(output), null, 2);
  };
}

/**
 * JSONFilter
 *
 * @method JSONFilter
 * @param {String} output the final build file produced by ethdeploy
 * @return {String} parsedOutput parsed output
 */
function JSONFilter() {
  var contractProperties = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ['address', 'interface', 'bytecode', 'transactionObject', 'inputs'];

  var self = this;
  self.process = function (output) {
    var jsonObject = JSON.parse(output);
    var outputObject = Object.assign({});

    Object.keys(jsonObject).forEach(function (environmentName) {
      outputObject[environmentName] = Object.assign({});

      Object.keys(jsonObject[environmentName]).forEach(function (contractName) {
        outputObject[environmentName][contractName] = Object.assign({});

        Object.keys(jsonObject[environmentName][contractName]).forEach(function (contactProperty) {
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
  JSONMinifier: JSONMinifier,
  JSONExpander: JSONExpander,
  JSONFilter: JSONFilter
};