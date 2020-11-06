const shell = require('node-powershell');
const https = require('https');
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;



module.exports = {
  createVPN
};

console.log(module.filename);
console.log(module.id);
console.log(module.exports);


function createVPN()
{

  let ps = new shell({
  executionPolicy: 'Bypass',
  noProfile: true
});
ps.addCommand('Get-ADUser -Filter * | ConvertTo-Json')
ps.invoke().then(output => {
  
    userData = (JSON.parse(output))
    //console.log(output);
    for(var i in userData)
    {
      ///([a-zA-Z]{2})([0-9]{4})/.test(userData.Name)
        if(userData[i].GivenName != null)
          {
            
           
        
            //console.log(userData[i].Name);
            const data = JSON.stringify({
                "jsonrpc": "2.0",
                "id": "rpc_call_id",
                "method": "CreateUser",
                "params": {
                "HubName_str": "TRANSAD_VPN",
                "Name_str": userData[i].Name ,
                "AuthType_u32": 5,
                "NtUsername_utf": userData[i].Name,
                }
              })
              
              const options = {
                hostname: 'localhost',
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
                //console.log(`statusCode: ${res.statusCode}`)
              
                res.on('data', d => {
                  const res = JSON.parse(d);
                  if(res.error)
                  {
                    process.stdout.write(`${JSON.stringify(res.error)} \n` );
                  }
                  else
                  {
                    process.stdout.write(`${JSON.stringify(res.result)}`);
                  }
                  
                  
                })
              })
              
              req.on('error', error => {
                console.error(error)
              })
              
              req.write(data)
              req.end()
            }
    }
  ps.dispose();
}).catch(err => {
  console.log(err);
  ps.dispose();
});
}


createVPN();