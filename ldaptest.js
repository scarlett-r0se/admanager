const { authenticate } = require('ldap-authentication')

module.exports={
    auth
}
console.log(module.exports);

async function auth(usename,password,callback) {
  
 try{
  // auth with regular user
  options = {
    ldapOpts: {
      url: 'ldap://10.0.2.6',
      // tlsOptions: { rejectUnauthorized: false }
    },
    userDn:`CN=${usename},OU=IT,OU=User Groups,DC=TRANSAD,DC=local`,
    userPassword: `${password}`,
    userSearchBase: 'DC=TRANSAD,DC=local',
    usernameAttribute: 'name',
    username: `${usename}`,
    // starttls: false
  }
 
  user = await authenticate(options)

  const User = {"cn":user.cn,"givenName":user.givenName,"sn":user.sn}
  callback(User);
}catch(err)
{
   callback({"error":err.lde_message});
}
}
 
//auth('SS6872','ChangeMe123');

