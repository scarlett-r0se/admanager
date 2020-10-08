const shell = require('node-powershell');
const https = require('https');
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;


module.exports = {
  
  psNewUser,
 
  
};


console.log(module.filename);
console.log(module.id);
console.log(module.exports);


async function psNewUser(user)
{
let ps = new shell({
  executionPolicy: 'Bypass',
  noProfile: true
});


ps.addCommand(`New-ADUser -Name ${user.Username} -DisplayName ${user.Username} -GivenName ${user.Fname} -Surname ${user.Lname} -Enabled $True -AccountPassword (ConvertTo-SecureString ${user.Password} -AsPlainText -force) -PassThru | % {Add-ADGroupMember -Identity "${user.Group}" -Members $_}`)
ps.invoke().then(output => {
    console.log(`Account ${user.Username} Created Successfully`);

    const data = JSON.stringify({
      "jsonrpc": "2.0",
      "id": "rpc_call_id",
      "method": "CreateUser",
      "params": {
      "HubName_str": "TRANSAD_VPN",
      "Name_str": user.Username ,
      "AuthType_u32": 5,
      "NtUsername_utf": user.Username,
      }
    })
    const options = {
      hostname: 'localhost',
      port: 5555,
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
    

    
  ps.dispose();
}).catch(err => {
  console.log("ERROR Caught ",err);
  //global.status = {"ERROR" : err};
  
  ps.dispose();
});

}


