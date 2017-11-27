const solc = require('solc');
const fs = require('fs');

// detect error type from error messages
function errortype(message) {
  return (String(message).match(/^(.*:[0-9]*:[0-9]* )?Warning: /) ? 'warning' : 'error');
}

// remove warnings from errors
function filterErrorWarnings(errors) {
  return (errors || []).filter(error => errortype(error) === 'error');
}

function findImportsFn (importResolves) {
  return (path) => {
    let contents
    importResolves.some((fallbackPath) => {
      try {
        contents = fs.readFileSync(`${fallbackPath}/${path}`).toString();
        return true;
      } catch (err) { }
    })
    if (contents) {
      return { contents };
    } else {
      return { error: 'File not found' };
    }
  }
}

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
  const adjustBase = loaderConfig.base;
  const filterWarnings = loaderConfig.filterWarnings;
  const filterFilenames = loaderConfig.filterFilenames;
  const importResolves = loaderConfig.importResolves;
  const findImports = loaderConfig.findImports ? loaderConfig.findImports : (importResolves ? findImportsFn(importResolves) : undefined);
  const adjustedSourceMap = {};

  if (adjustBase) {
    Object.keys(sourceMap).forEach(filePath => {
      adjustedSourceMap[filePath.replace(adjustBase, '').replace(/\/\//g, '').trim()] = sourceMap[filePath];
    });
  }

  const output = solc.compile({ sources: (adjustBase ? adjustedSourceMap : sourceMap) }, (loaderConfig.optimize || 0), findImports);
  const errors = (filterWarnings ? filterErrorWarnings(output.errors) : output.errors) || [];
  const outputContracts = Object.assign({}, output.contracts);

  if (errors.length > 0) {
    throw new Error(`[solc-loader] while compiling contracts, errors: ${JSON.stringify((output.errors || []), null, 2)}`);
  }

  if (filterFilenames) {
    Object.keys(outputContracts)
    .forEach(sourceKey => {
      const savedSource = Object.assign({}, outputContracts[sourceKey]);
      delete outputContracts[sourceKey];

      const filteredName = String(sourceKey).split(':').pop();
      outputContracts[filteredName] = savedSource;
    });
  }

  return { [environment.name]: outputContracts };
};
