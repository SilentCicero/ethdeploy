const utils = require('./utils/index.js');
const lib = require('./lib/index.js');
const cloneDeep = require('clone-deep');
const deployPlugins = require('./plugins/index.js');
const bnToString = utils.bnToString;
const error = utils.error;
const configError = lib.configError;
const entrySourceMap = lib.entrySourceMap;
const loadEnvironment = lib.loadEnvironment;
const loadContracts = lib.loadContracts;
const buildDeployer = lib.buildDeployMethod;
const processOutput = lib.processOutput;
const transformContracts = lib.transformContracts;


/**
 * Intakes config object, deploys contracts, outputs result as string for file writting.
 *
 * @method ethdeploy
 * @param {Object|Function} config the ethdeploy config object or method
 * @param {Function} callbackInput the final callback that returns the output
 * @callback {Object} outputObject returns the final config object, and contracts output
 */
module.exports = function ethdeploy(config, callbackInput) { // eslint-disable-line
  // this is the initial deployed contracts store
  var deployedContracts = {}; // eslint-disable-line
  const callback = callbackInput || function cb() {};

  if (typeof config !== 'function' && typeof config !== 'object') {
    return callback(error('config input param must be a type Object or Function.'), null);
  }

  // build config object with options, plugins
  const configObject = (typeof config !== 'function') ? config : config({ plugins: deployPlugins });

  // validate the config object, if error, stop process
  if (configError(configObject) !== null) {
    return callback(error(configError(configObject)), null);
  }

  // stage loaders, deployer, environment transform, plugins, entry, env, deployment
  const buildDeployMethod = configObject.deployer || buildDeployer;
  const buildEnvironment = configObject.environmentLoader || loadEnvironment;
  const entry = configObject.entry;
  const modulePreLoaders = configObject.module.preLoaders || [];
  const moduleLoaders = configObject.module.loaders || [];
  const moduleEnvironment = configObject.module.environment;
  const moduleDeloyment = configObject.module.deployment;
  const plugins = configObject.plugins || [];
  const loadEntry = configObject.sourceMapper || entrySourceMap;

  // build report method
  const reportMethod = (name, data, address, inputs, transactionObject, receipt) => {
    deployedContracts = Object.assign({}, cloneDeep(deployedContracts), bnToString({
      [name]: Object.assign({}, cloneDeep(deployedContracts[name] || {}), cloneDeep(data), { name, address, inputs, transactionObject, receipt }),
    }, 16, true));
  };

  // build sourcemap from entry
  loadEntry(entry, (sourceMapError, sourceMap) => { // eslint-disable-line
    if (sourceMapError !== null) { return callback(error(sourceMapError), null); }

    // transform environment
    buildEnvironment(moduleEnvironment, (envTransformError, environment) => { // eslint-disable-line
      if (envTransformError !== null) { return callback(error(envTransformError, null)); }

      // load and process contracts from sourcemap, base contracts layer
      loadContracts(modulePreLoaders, {}, sourceMap, environment, (preLoaderError, baseContracts) => { // eslint-disable-line
        if (preLoaderError !== null) { return callback(error(preLoaderError), null); }

        // load and process contracts from sourcemap
        loadContracts(moduleLoaders, baseContracts, sourceMap, environment, (loaderError, contracts) => { // eslint-disable-line
          if (loaderError !== null) { return callback(error(loaderError), null); }

          // build done method
          const doneMethod = () => {
            const finalOutput = Object.assign({}, cloneDeep(baseContracts), {
              [environment.name]: cloneDeep(deployedContracts),
            });

            // final output processing with plugins
            processOutput(plugins, finalOutput, configObject, (pluginError, outputString) => {
              if (pluginError) {
                callback(pluginError, null);
              } else {
                callback(null, { config: configObject, output: outputString });
              }
            });

            utils.log('Deployment module completed!');
          };

          // scoped base contracts
          const scopedBaseContracts = transformContracts(baseContracts, environment.name);

          // scope the contracts only to the environment being deployed
          const scopedContracts = transformContracts(contracts, environment.name);

          // build deploy method
          const deployMethod = buildDeployMethod(scopedBaseContracts, environment, reportMethod);

          // run the deployment module
          moduleDeloyment(deployMethod, scopedContracts, doneMethod, environment);
        });
      });
    });
  });
};
