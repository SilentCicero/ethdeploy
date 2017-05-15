/**
 * Here the sourcemap is the contracts JSON, so we can just copy, name and return.
 *
 * @method loader
 * @param {Object} sourceMap the file source map
 * @param {Object} loaderConfig the config for the specified loader
 * @param {Object} environment the loaded environment object
 * @return {Object} contracts the output contracts
 */
module.exports = function loader(sourceMap, loaderConfig, environment) { // eslint-disable-line
  return Object.assign({}, { [environment.name]: sourceMap });
};
