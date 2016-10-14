#!/usr/bin/env node

const deployer = require('../index.js');
const fs = require('fs');
const meow = require('meow');
const path = require('path');

// handle cli
const cli = meow(`
    Usage
      $ ethdeploy <ethdeploy.config.js path>

    Examples
      $ ethdeploy ./ethdeploy.config.js
`);

// deploy config
const ethdeployConfig = require(path.resolve(cli.input[0]));

// deployer
deployer(ethdeployConfig, function (deployError, deployResult) {
  if (deployError) throw new Error(deployError);

  // write file
  fs.writeFile(path.resolve(ethdeployConfig.output.path), JSON.stringify(deployResult, null, 2), 'utf8', (writeFileError) => {
    if (writeFileError) throw new Error(writeFileError);

    // exit(0);
  });
});
