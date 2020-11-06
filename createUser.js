const shell = require('node-powershell');
const https = require('https');
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;


module.exports = {
  
  psNewUser,
  psGetUsers,
};



function psNewUser(user,callback)
{
let ps = new shell({
  executionPolicy: 'Bypass',
  noProfile: true
});
console.log("THE PASSWORD SENT TO AD IS",user.Password.asciiDecode().trim());
//($Secure_String_Pwd = ConvertTo-SecureString "${user.Password}" -AsPlainText -force)
ps.addCommand(`New-ADUser -path "OU=${user.Group}, OU=User Groups, DC=TRANSAD, DC=local" -UserPrincipalName "${user.Username}@TRANSAD.local" -Name ${user.Username} -DisplayName ${user.Username} -GivenName ${user.Fname} -Surname ${user.Lname} -PasswordNeverExpires $True -Enabled $True -AccountPassword ($Secure_String_Pwd = ConvertTo-SecureString -AsPlainText '${user.Password.asciiDecode().trim()}'  -force) -PassThru | % {Add-ADGroupMember -Identity "${user.Group}" -Members $_}`)
ps.invoke().then(output => {
    callback(`Account ${user.Username} Created Successfully`)
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
      port: 5556,
      path: '/api',
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length,
          'X-VPNADMIN-HUBNAME':process.env.XVPNADMINHUBNAME,	
          'X-VPNADMIN-PASSWORD':process.env.XVPNADMINPASSWORD
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
  callback(err);  
  ps.dispose();
});

}


function psGetUsers(callback)
{

  let ps = new shell({
    executionPolicy: 'Bypass',
    noProfile: true
  });

  ps.addCommand(`Get-ADUser  -SearchBase "OU=User Groups,DC=TRANSAD,DC=local" -filter * | ConvertTo-Json`)
    ps.invoke().then(output=>{

      //console.log(output);
      callback(output);


    
    ps.dispose();
    }).catch(err => {
      console.log("ERROR Caught ",err);
      callback(err);  
      ps.dispose();
    });



}

String.prototype.asciiEncode = function(){

  var ascii = '';
      for(var i =0; i<this.length;i++)
      {
          let asc = this.charCodeAt(i);
          //console.log(asc);
          if(asc.toString().length<3)
          {
              ascii += '0'+ asc;
          }
          else{
              ascii += asc;
          }
          
      }
  
  
  return ascii;
  }
  
  String.prototype.asciiDecode = function(){
      var string ='';
      for(let i =0;i<this.length;i++)
      {
          if(i%3==0)
          {
              string += String.fromCharCode(this.slice(i,i+3));
              //console.log(i ,ascii.slice(i,i+3));
  
          }
      }
  return string;
  }
