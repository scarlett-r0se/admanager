var Service = require('node-windows').Service;

// Create a new service object
console.log("Attempting to Start Node project");
var svc = new Service({
  name:'AD WEB MANAGER',
  description: 'Starts the AD Web Manager and runs it as a background service.',
  script: 'C:\\Users\\Administrator\\Documents\\AdminShare\\vpngenerator\\index.js',
  nodeOptions: [
    '--harmony',
    '--max_old_space_size=4096'
  ]
  //, workingDirectory: '...'
  //, allowServiceLogon: true
});
 
// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install',function(){
  svc.start();
});
 
svc.install();


