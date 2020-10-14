const express = require('express')
const https = require('https');
const app = express()
var session = require('express-session'); 
const createUser = require('./createUser');
var fs = require('fs');
const bcrypt = require('bcrypt');
var mysql = require('mysql');
require('dotenv').config();
app.use(express.static(__dirname + '/website'));


app.use(session(JSON.parse(process.env.session)));

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const conInfo = JSON.parse(process.env.conInfo);

app.all('/', (req, res) => {
  res.writeHead(200, {'Content-Type': 'text/html'});
  var index = fs.readFileSync('website/index.html');
  res.end(index);
})


app.all('/register',register);//Creates a new User
app.all('/whoIsLoggedIn',whoIsLoggedIn)//Checks who is logged in
app.all('/login',login);//logs user in
app.all('/logout',logout); //logs user out
app.all('/listusers',showAdmins);


app.all('/test',testdbconnection);//TEST
app.all('/testQ',testquery);//TEST
app.all('/testsession',testsession);//TEST
app.all('/viewsession',viewsession);//TEST


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

app.get('/createaccount', (req, res) => {
    if (IsLoggedIn(req,res))
    {
      res.writeHead(200, {'Content-Type': 'text/html'});
      var index = fs.readFileSync('website/createaccount.html');
      res.end(index);
    }
    else
    {
      res.redirect("http://10.0.2.6:3000/login.html");
    }
})

app.get('/accountpage',(req, res) => {
  if (IsLoggedIn(req,res))
  {
    res.writeHead(200, {'Content-Type': 'text/html'});
    var index = fs.readFileSync('website/accountpage.html');
    res.end(index);
  }
  else
  {
    res.redirect("http://10.0.2.6:3000/login.html");
  }
});

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

  if(req.query.MPASSWORD!=process.env.MPASSWORD)
  {
    writeResult(req,res,{'error' : "Please specify the specify the master password"});
    return;
  }

console.log("API REQUEST RECIEVED");

console.log(req.query.q);

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
        console.log(JSONRes);
        res.send(JSONRes);
    })
  })
  POST.on('error', error => {
    console.error(error)
  })
  POST.write(data)
  POST.end()


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
//TEST FUNCTIONS
function testdbconnection(req,res)
{
var con = mysql.createConnection(conInfo);
con.connect(function(err) 
{
  if (err) 
    res.send({'error' : err});
  else
  {
    res.send('DBCONNECTION SUCCESSFUL');
    console.log('DBCONNECTION SUCCESSFUL');
  }
}); 
}

function testquery(req,res)
{
var con = mysql.createConnection(conInfo);
con.connect(function(err) 
{
  if (err) 
    res.send({'error' : err});
  else
  {
    console.log('DBCONNECTION SUCCESSFUL');
    con.query("DESC USER", function (err, result, fields) 
            {
              if (err) 
                res.send({'error' : err});
              else
                res.send({'result' : result});
            });
  }
}); 
}

function testsession(req,res)
{
    console.log(req.query.q);
    req.session.q = req.query.q;
    res.send(req.session.q);
}
function viewsession(req,res)
{
    res.send(req.session.q);
}
//END OF TEST FUNCTIONS
//=============================================================
//HELPER FUNCTIONS
function validateEmail(email) 
{
  if (email == undefined)
  {
    return false;
  }
  else
  {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }
}

function validatePassword(pass)
{
  if (pass == undefined)
  {
    return false;
  }
  else
  {
    var re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return re.test(pass);
  }
}
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
//END OF HELPERFUNCTIONS
//=============================================================
//DBFUNTIONS

function register(req, res)
{
  if(req.query.MPASSWORD!=process.env.MPASSWORD)
  {
    writeResult(req,res,{'error' : "Please specify the specify the master password"});
    return;
  }

  if (req.query.email == undefined || !validateEmail(req.query.email))
  {
    writeResult(req, res, {'error' : "Please specify a valid email"});
    return;
  }

  if (req.query.password == undefined || !validatePassword(req.query.password))
  {
    writeResult(req, res, {'error' : "Password must have a minimum of eight characters, at least one letter and one number"});
    return;
  }

  var con = mysql.createConnection(conInfo);
  con.connect(function(err) 
  {
    if (err) 
      writeResult(req, res, {'error' : err});
    else
    {
      // bcrypt uses random salt is effective for fighting
      // rainbow tables, and the cost factor slows down the
      // algorithm which neutralizes brute force attacks ...
      let hash = bcrypt.hashSync(req.query.password, 12);
      con.query("INSERT INTO USER (USER_EMAIL, USER_PASS) VALUES (?, ?)", [req.query.email, hash], function (err, result, fields) 
      {
        if (err) 
        {
          if (err.code == "ER_DUP_ENTRY")
            err = "User account already exists.";
          writeResult(req, res, {'error' : err});
        }
        else
        {
          con.query("SELECT * FROM USER WHERE USER_EMAIL = ?", [req.query.email], function (err, result, fields) 
          {
            if (err) 
              writeResult(req, res, {'error' : err});
            else
            {
              req.session.user = {'result' : {'id': result[0].USER_ID, 'email': result[0].USER_EMAIL, "score":result[0].SCORE_VALUE}};
              writeResult(req, res, req.session.user);
            }
          });
        }
      });
    }
  });
  
}

function login(req, res)
{
  if (req.query.email == undefined)
  {
    writeResult(req, res, {'error' : "Email is required"});
    return;
  }

  if (req.query.password == undefined)
  {
    writeResult(req, res, {'error' : "Password is required"});
    return;
  }
  
  var con = mysql.createConnection(conInfo);
  con.connect(function(err) 
  {
    if (err) 
      writeResult(req, res, {'error' : err});
    else
    {
      con.query("SELECT * FROM USER WHERE USER_EMAIL = ?", [req.query.email], function (err, result, fields) 
      {
        if (err) 
          writeResult(req, res, {'error' : err});
        else
        {
          if(result.length == 1 && bcrypt.compareSync(req.query.password, result[0].USER_PASS))
          {
            req.session.user = {'result' : {'id': result[0].USER_ID, 'email': result[0].USER_EMAIL, "score":result[0].USER_SCORE}};
            writeResult(req, res, req.session.user);
          }
          else 
          {
            writeResult(req, res, {'error': "Invalid email/password"});
          }
        }
      });
    }
  });
}

function logout(req, res)
{
  req.session.user = undefined;
  writeResult(req, res, {'error' : 'Nobody is logged in.'});
}
function whoIsLoggedIn(req, res)
{
  if (req.session.user == undefined)
    writeResult(req, res, {'error' : 'Nobody is logged in.'});
  else
    writeResult(req, res, req.session.user);
}

function showAdmins(req,res)
{
if(IsLoggedIn(req, res))
{
var con = mysql.createConnection(conInfo);
con.connect(function(err) 
{
  if (err) 
    res.send({'error' : err});
  else
  {
    console.log('DBCONNECTION SUCCESSFUL');
    con.query("SELECT * FROM USER", function (err, result, fields) 
            {
              if (err) 
                res.send({'error' : err});
              else
                res.send({'result' : result});
            });
  }
}); 
}
else{
  whoIsLoggedIn(req,res);
}
}

//END OF DBFUNTIONS


