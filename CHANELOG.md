# Changelog

## ethdeploy v0.1.1 -- custom provider modules

This update allows you to build your own environment provider modules. Here is the HTTP provider module in full:

```js
// require web3
const Web3ProviderInstance = require('web3');

// ethdeploy HTTP provider
const ethdeployHTTPProvider = function(providerObject) {
  // setup http provider instance
  const web3Provider = new Web3ProviderInstance.providers.HttpProvider(`${providerObject.host}:${providerObject.port}`);

  // return web3 provider
  return web3Provider;
};

module.exports = ethdeployHTTPProvider;
```

This is very similar to the webpack loader approach. It will allow us to build custom providers for `ethdeploy`. See: #Ethdeploy Provider Module System in the `README.md` for more details.

## ethdeploy v0.1.0 -- the first publish

Excited to launch the first ethdeploy module. This module is meant to be a highly configurable deployment staging tool. Contract deployment can be a very complicated process, which certainly requires it's own modules to preform the task. Javascript is a relatively good choice to build such a staging module -- considering its accessibility as a language. This module is meant to make the arduous task of staging and deploying your contracts relatively menial. The main ethdeploy module is meant to hold the core code of the deployment staging processes. However, other modules for cli and webpack integrations will come.
