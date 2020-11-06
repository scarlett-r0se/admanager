const express = require('express')
const https = require('https');
const app = express()
var session = require('express-session'); 
const createUser = require('./createUser');
var fs = require('fs');
const bcrypt = require('bcrypt');
var mysql = require('mysql');
const { nextTick } = require('process');
require('dotenv').config();
const statusMonitor = require('express-status-monitor')();
const ldap = require('./ldaptest');

app.use(express.static(__dirname + '/website'));


app.use(session(JSON.parse(process.env.session)));

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const conInfo = JSON.parse(process.env.conInfo);

app.all('/', (req, res) => {
  res.writeHead(200, {'Content-Type': 'text/html'});
  var index = fs.readFileSync('website/index.html');
  res.end(index);
})

app.get('/status', ensureloggedin, statusMonitor.pageRoute)
app.use(statusMonitor);


app.all('/logout',logout); 
app.all('/ldapAuth',ldapAuth);
app.all('/whoIsLoggedIn',whoIsLoggedIn)





app.listen(process.env.PORT,  process.env.IP, startHandler())

function startHandler()
{
  console.log(`Server listening at http://${process.env.IP}:${process.env.PORT}; started at ${time()}`);
}

function writeResult(req, res, obj)
{
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.write(JSON.stringify(obj));
  res.end('');
}

//===================================================
//AD/VPN WRAPPER FUNCTIONS
app.get('/isalive', (req, res) => {
  res.send("Yes the Server is Alive.")
})

app.get('/createaccount',ensureloggedin, (req, res) => {
      res.writeHead(200, {'Content-Type': 'text/html'});
      var index = fs.readFileSync('website/createaccount.html');
      res.end(index);
})

app.get('/accountpage',ensureloggedin,(req, res) => {
  
    res.writeHead(200, {'Content-Type': 'text/html'});
    var index = fs.readFileSync('website/accountpage.html');
    res.end(index);
  
 
});

app.get('/accountdeactivate',(req,res)=>{
  res.writeHead(200, {'Content-Type': 'text/html'});
    var index = fs.readFileSync('website/accountdeactivate.html');
    res.end(index);
})

app.get('/newuser', (req, res) => {
  
  //res.send('NEW USER REQUEST RECIEVED');
  console.log("/newuser has been pinged with the following data:")
  if(IsLoggedIn(req,res))
  {
    createUser.psNewUser(req.query,(output)=>{
      res.send(output);
  
    });
    
  }
  else{
    res.send("You Must be logged in to create a new user");
    return;
  }
  
  

 // res.send(`Request Received. Sent New User Request to the server`);
  
 
  
})

app.get('/vpn',(req,res)=>{
/*
  if(req.query.MPASSWORD!=process.env.MPASSWORD)
  {
    writeResult(req,res,{'error' : "Please specify the specify the master password"});
    return;
  }
*/
console.log("API REQUEST RECIEVED");

//console.log(req.query.q);

    const data = req.query.q;

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

  const POST = https.request(options, response => {
    console.log(`statusCode: ${response.statusCode}`)
    response.on('data', d => {
        const JSONRes = JSON.parse(d);
        //console.log(JSONRes);
        res.send(JSONRes);
    })
  })
  POST.on('error', error => {
    console.error(error)
  })
  POST.write(data)
  POST.end()


})

app.all('/vpnStatus',(req,res)=>{
  res.writeHead(200, {'Content-Type': 'text/html'});
  var index = fs.readFileSync('website/softether.html');
  res.end(index);

})

app.all('/getADusers',(req,res)=>{
  createUser.psGetUsers(output=>{
    res.send(JSON.parse(output));
  })
})


function time(){
  let date_ob = new Date();

// current date
// adjust 0 before single digit date
let date = ("0" + date_ob.getDate()).slice(-2);

// current month
let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

// current year
let year = date_ob.getFullYear();

// current hours
let hours = date_ob.getHours();

// current minutes
let minutes = date_ob.getMinutes();

// current seconds
let seconds = date_ob.getSeconds();

// prints date in YYYY-MM-DD format
//console.log(year + "-" + month + "-" + date);

// prints date & time in YYYY-MM-DD HH:MM:SS format
return year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;

}


// END OF AD/VPN WRAPPER FUNCTIONS
//===================================================
//404 function
app.get('*', function(req, res)
{
  res.writeHead(404, {'Content-Type': 'text/html'});
  var FoF = fs.readFileSync('website/404.html');
  res.end(FoF);
});
//===================================================

//END OF TEST FUNCTIONS
//=============================================================
//HELPER FUNCTIONS

function whoIsLoggedIn(req, res)
{
  if (req.session.user == undefined)
    writeResult(req, res, {'error' : 'Nobody is logged in.'});
  else
    writeResult(req, res, req.session.user);
}
function IsLoggedIn(req, res)
{
  if (req.session.user == undefined)
    return false;
  else
    return true;
}
function logout(req, res)
{
  req.session.user = undefined;
  writeResult(req, res, {'error' : 'Nobody is logged in.'});
}
function ensureloggedin (req, res, next) {
  
  if(IsLoggedIn(req,res))
  {
    next();
  }
  else
  {
    res.redirect('http://10.0.2.6:3000/login.html');
  }
} //middleware function
//END OF HELPERFUNCTIONS
//=============================================================

//ldap stuff
function ldapAuth(req,res){
console.log(req.query);
username = req.query.username;
password = req.query.password;
ldap.auth(username,password,(output)=>{
  
  console.log(output);
  if(!output.error)
  {
    
    req.session.user = {"result" : output};
    writeResult(req,res, {"result" : output});

  }
  else{
    writeResult(req,res,output);
  }

  
});

}
//=======================================

