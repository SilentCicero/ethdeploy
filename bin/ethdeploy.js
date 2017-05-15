#!/usr/bin/env node

const meow = require('meow');
const path = require('path');
const fs = require('fs');
const ethdeploy = require('../src/index.js');
const log = require('../src/utils/index.js').log;

function noop2Callback(v, d, cb) {
  cb(null, null);
}

function renameIfExsits(renamePath, renamePathOutput, cb) {
  if (fs.existsSync(renamePath)) {
    return fs.rename(renamePath, renamePathOutput, cb);
  }

  cb(null, null);
  return null;
}

// handle cli
const cli = meow(`
    Usage
      $ ethdeploy <path to config>
    Options
      --help           the help CLI
      --version, -v    the package verson number
    Example
      $ ethdeploy ./ethdeploy.config.testnet.js
`, {
  alias: {},
});

if (typeof cli.input[0] === 'undefined') {
  cli.showHelp();
} else {
  const configPath = path.resolve(cli.input[0]);
  const configObject = require(configPath); // eslint-disable-line

  ethdeploy(configObject, (deployError, deployResult) => {
    if (deployError) {
      log('Deployment error', deployError);
      process.exit(1);
    }

    // config from result
    const config = deployResult.config;

    // if config output file is specified
    if (typeof config.output === 'object') {
      const outputString = deployResult.output;
      const outputFile = path.resolve(config.output.path, config.output.filename);
      const outputSafe = config.output.safe || false;
      const outputFileSafe = `${outputFile}_backup_${(new Date()).toISOString()}`;
      const renameMethod = outputSafe ? renameIfExsits : noop2Callback;

      // backup output from previous builds
      renameMethod(outputFile, outputFileSafe, renameError => {
        if (renameError) {
          log(`while writting safe output backup file: ${renameError}`);
          process.exit(1);
        }

        fs.writeFile(outputFile, outputString, (writeFileError) => {
          if (writeFileError) {
            log(`while writting output file to ${outputFile}: ${writeFileError}`);
            process.exit(1);
          }

          log(`Deployment file written to: ${outputFile}`);
        });
      });
    }
  });
}
