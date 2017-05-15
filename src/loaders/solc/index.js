const solc = require('solc');

/**
 * Compiles solidity files in sourcemap, returns contracts.
 *
 * @method loader
 * @param {Object} sourceMap the file source map
 * @param {Object} loaderConfig the config for the specified loader
 * @param {Object} environment the loaded environment object
 * @return {Object} contracts the output contracts
 */
module.exports = function solcLoader(sourceMap, loaderConfig, environment) {
  const output = solc.compile({ sources: sourceMap }, (loaderConfig.optimize || 0));

  if (output.errors) {
    throw new Error(`[solc-loader] while compiling contracts, errors: ${JSON.stringify(output.errors, null, 2)}`);
  }

  return { [environment.name]: output.contracts };
};
