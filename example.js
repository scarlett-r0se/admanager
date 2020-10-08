
const https = require('https');
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const data = JSON.stringify({
    "jsonrpc": "2.0",
  "id": "rpc_call_id",
  "method": "GetServerInfo",
  "params": {}
    
  })

const options = {
    hostname: 'transad.inertialframe.net',
    port: 5556,
    path: '/api',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'X-VPNADMIN-HUBNAME':'administrator',	
        'X-VPNADMIN-PASSWORD':'420Blazeit!'
    }
  }

  const req = https.request(options, res => {
                console.log(`statusCode: ${res.statusCode}`)
                res.on('data', d => {
                    const res = JSON.parse(d);
                   // process.stdout.write(d);
                    console.log(res);
                    
                })
              })
              req.on('error', error => {
                console.error(error)
              })
              req.write(data)
              req.end()
  
  