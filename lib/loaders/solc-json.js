'use strict';

// like solc output
function solcOutputLike(obj) {
  var isSolcLike = false;

  Object.keys(obj).forEach(function (key) {
    if (!isSolcLike && typeof obj[key] === 'object') {
      isSolcLike = typeof obj[key].bytecode === 'string' && typeof obj[key]['interface'] === 'string';
    }
  });

  return isSolcLike;
}

/**
 * Loads JSON produced by solc, formats it for environment style
 *
 * @method loader
 * @param {Object} sourceMap the file source map
 * @param {Object} loaderConfig the config for the specified loader
 * @param {Object} environment the loaded environment object
 * @return {Object} contracts the output contracts
 */
module.exports = function loader(sourceMap, loaderConfig, environment) {
  var _ref;

  var solcContracts = {};

  sourceMap.forEach(function (fileName) {
    try {
      var testJSON = JSON.parse(sourceMap[fileName]);

      // if the file looks like a solc output file
      if (solcOutputLike(testJSON)) {
        solcContracts[fileName] = testJSON;
      }
    } catch (jsonError) {
      throw new Error('[solc-json] while loading solc JSON, error: ' + JSON.stringify(jsonError));
    }
  });

  return _ref = {}, _ref[environment.name] = solcContracts, _ref;
};