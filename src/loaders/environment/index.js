const deepAssign = require('deep-assign');

/**
 * Loads an environments.json file, produced by ethdeploy
 *
 * @method loader
 * @param {Object} sourceMap the file source map
 * @param {Object} loaderConfig the config for the specified loader
 * @param {Object} environment the loaded environment object
 * @return {Object} contracts the output contracts
 */
module.exports = function loader(sourceMap, loaderConfig, environment) { // eslint-disable-line
  let outputObject = Object.assign({});

  Object.keys(sourceMap).forEach((fileName) => {
    try {
      const source = (sourceMap[fileName] === '' && loaderConfig.build) ? '{}' : sourceMap[fileName];
      const testJSON = JSON.parse(source);

      // if not an object
      if (typeof testJSON !== 'object') { throw new Error(`the file '${fileName}' did not result in a type Object json result.`); }

      outputObject = deepAssign({}, outputObject, testJSON);
    } catch (jsonError) {
      throw new Error(`while loading environment JSON from file '${fileName}', JSON error: ${JSON.stringify(jsonError)}`);
    }
  });

  return outputObject;
};
