// like solc output
function solcOutputLike(obj) {
  let isSolcLike = false;

  Object.keys(obj).forEach((key) => {
    if (!isSolcLike && typeof obj[key] === 'object') {
      isSolcLike = (typeof obj[key].bytecode === 'string'
                 && typeof obj[key].interface === 'string');
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
  const solcContracts = {};

  sourceMap.forEach((fileName) => {
    try {
      const testJSON = JSON.parse(sourceMap[fileName]);

      // if not an object
      if (typeof testJSON !== 'object') { throw new Error(`the file '${fileName}' did not result in a type Object json result.`); }

      // if the file looks like a solc output file
      if (solcOutputLike(testJSON)) {
        solcContracts[fileName] = testJSON;
      }
    } catch (jsonError) {
      throw new Error(`[solc-json] while loading solc JSON, error: ${JSON.stringify(jsonError)}`);
    }
  });

  return { [environment.name]: solcContracts };
};
