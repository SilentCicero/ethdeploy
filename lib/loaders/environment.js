'use strict';

var deepAssign = require('deep-assign');

/**
 * Loads an environments.json file, produced by ethdeploy
 *
 * @method loader
 * @param {Object} sourceMap the file source map
 * @param {Object} loaderConfig the config for the specified loader
 * @param {Object} environment the loaded environment object
 * @return {Object} contracts the output contracts
 */
module.exports = function loader(sourceMap, loaderConfig, environment) {
  // eslint-disable-line
  var outputObject = Object.assign({});

  sourceMap.forEach(function (fileName) {
    try {
      var source = sourceMap[fileName] === '' && loaderConfig.build ? '{}' : sourceMap[fileName];
      var testJSON = JSON.parse(source);

      outputObject = deepAssign({}, outputObject, testJSON);
    } catch (jsonError) {
      throw new Error('while loading environment JSON from file \'' + fileName + '\', JSON error: ' + JSON.stringify(jsonError));
    }
  });

  return outputObject;
};