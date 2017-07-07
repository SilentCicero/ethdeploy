'use strict';

var utils = require('./utils/index.js');
var lib = require('./lib/index.js');
var cloneDeep = require('clone-deep');
var deployPlugins = require('./plugins/index.js');
var bnToString = utils.bnToString;
var error = utils.error;
var configError = lib.configError;
var entrySourceMap = lib.entrySourceMap;
var loadEnvironment = lib.loadEnvironment;
var loadContracts = lib.loadContracts;
var buildDeployer = lib.buildDeployMethod;
var processOutput = lib.processOutput;
var transformContracts = lib.transformContracts;

/**
 * Intakes config object, deploys contracts, outputs result as string for file writting.
 *
 * @method ethdeploy
 * @param {Object|Function} config the ethdeploy config object or method
 * @param {Function} callbackInput the final callback that returns the output
 * @callback {Object} outputObject returns the final config object, and contracts output
 */
module.exports = function ethdeploy(config, callbackInput) {
  // eslint-disable-line
  // this is the initial deployed contracts store
  var deployedContracts = {}; // eslint-disable-line
  var callback = callbackInput || function cb() {};

  if (typeof config !== 'function' && typeof config !== 'object') {
    return callback(error('config input param must be a type Object or Function.'), null);
  }

  // build config object with options, plugins
  var configObject = typeof config !== 'function' ? config : config({ plugins: deployPlugins });

  // validate the config object, if error, stop process
  if (configError(configObject) !== null) {
    return callback(error(configError(configObject)), null);
  }

  // stage loaders, deployer, environment transform, plugins, entry, env, deployment
  var buildDeployMethod = configObject.deployer || buildDeployer;
  var buildEnvironment = configObject.environmentLoader || loadEnvironment;
  var entry = configObject.entry;
  var modulePreLoaders = configObject.module.preLoaders || [];
  var moduleLoaders = configObject.module.loaders || [];
  var moduleEnvironment = configObject.module.environment;
  var moduleDeloyment = configObject.module.deployment;
  var plugins = configObject.plugins || [];
  var loadEntry = configObject.sourceMapper || entrySourceMap;

  // build report method
  var reportMethod = function reportMethod(name, data, address, inputs, transactionObject, receipt) {
    var _bnToString;

    deployedContracts = Object.assign({}, cloneDeep(deployedContracts), bnToString((_bnToString = {}, _bnToString[name] = Object.assign({}, cloneDeep(deployedContracts[name] || {}), cloneDeep(data), { name: name, address: address, inputs: inputs, transactionObject: transactionObject, receipt: receipt }), _bnToString), 16, true));
  };

  // build sourcemap from entry
  loadEntry(entry, function (sourceMapError, sourceMap) {
    // eslint-disable-line
    if (sourceMapError !== null) {
      return callback(error(sourceMapError), null);
    }

    // transform environment
    buildEnvironment(moduleEnvironment, function (envTransformError, environment) {
      // eslint-disable-line
      if (envTransformError !== null) {
        return callback(error(envTransformError, null));
      }

      // load and process contracts from sourcemap, base contracts layer
      loadContracts(modulePreLoaders, {}, sourceMap, environment, function (preLoaderError, baseContracts) {
        // eslint-disable-line
        if (preLoaderError !== null) {
          return callback(error(preLoaderError), null);
        }

        // load and process contracts from sourcemap
        loadContracts(moduleLoaders, baseContracts, sourceMap, environment, function (loaderError, contracts) {
          // eslint-disable-line
          if (loaderError !== null) {
            return callback(error(loaderError), null);
          }

          // build done method
          var doneMethod = function doneMethod() {
            var _Object$assign;

            var finalOutput = Object.assign({}, cloneDeep(baseContracts), (_Object$assign = {}, _Object$assign[environment.name] = cloneDeep(deployedContracts), _Object$assign));

            // final output processing with plugins
            processOutput(plugins, finalOutput, configObject, function (pluginError, outputString) {
              if (pluginError) {
                callback(pluginError, null);
              } else {
                callback(null, { config: configObject, output: outputString });
              }
            });

            utils.log('Deployment module completed!');
          };

          // scoped base contracts
          var scopedBaseContracts = transformContracts(baseContracts, environment.name);

          // scope the contracts only to the environment being deployed
          var scopedContracts = transformContracts(contracts, environment.name);

          // build deploy method
          var deployMethod = buildDeployMethod(scopedBaseContracts, environment, reportMethod);

          // run the deployment module
          moduleDeloyment(deployMethod, scopedContracts, doneMethod, environment);
        });
      });
    });
  });
};