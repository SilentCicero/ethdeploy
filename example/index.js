// require ethdeploy, solc and the deployModule
const ethdeploy = require('../index');
// const ethdeployConfig = require('./ethdeploy.config.js');
// const ethdeployConfig = require('./ethdeploy-multi.config.js');
 const ethdeployConfig = require('./ethdeploy.config.js');

 var TestRPC = require("ethereumjs-testrpc");
 var server = TestRPC.server();

 server.listen("8545", function(err, blockchain) {
   console.log('Testrpc', err, blockchain);
 });

// wait for server to startup...
setTimeout(function(){
  // make sure you run "testrpc" before this script
  // this will now run ethdeploy to deploy to the specified environment
  // setup in the config object above, it will async callback return either an error
  // or an environments build object
  ethdeploy(ethdeployConfig, function(ethdeployError, ethdeployResult){
    if (ethdeployError) {
      throw 'There was an error ethdeploying your contracts';
    }

    if (ethdeployResult) {
      console.log(`
      Deployment success! Environments build object created:

  ${JSON.stringify(ethdeployResult, null, 2)}
    `);
    }
  });
}, 3000);
