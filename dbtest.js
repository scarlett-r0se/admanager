
const express = require('express');
const app = express();
var session = require('express-session'); 
const bcrypt = require('bcrypt');
var http = require('http');
var fs = require('fs');
var mysql = require('mysql');

app.use(session({ secret: 'happy jungle', 
                  resave: false, 
                  saveUninitialized: false, 
                  cookie: { maxAge: 6000000 }}));

process.env.PORT = 3001;
process.env.IP = '127.0.0.1';

const conInfo = 
{
    host: '127.0.0.1',
    user: 'root',
    password: 'DATrans@$12345',
    database: "webauth"
};

app.all('/',(req,res)=>{res.send('page loaded');}) //Default 
app.all('/register',register);//Creates a new User
app.all('/whoIsLoggedIn',whoIsLoggedIn)//Checks who is logged in
app.all('/login',login);//logs user in
app.all('/logout',logout); //logs user out


app.all('/test',testdbconnection);//TEST
app.all('/testQ',testquery);//TEST
app.all('/testsession',testsession);//TEST
app.all('/viewsession',viewsession);//TEST



app.all('/',(req,res)=>{
    res.send('page loaded');
})

app.listen(process.env.PORT,  process.env.IP, startHandler())

function startHandler()
{
  console.log('Server listening on port ' + process.env.PORT)
}

function writeResult(req, res, obj)
{
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.write(JSON.stringify(obj));
  res.end('');
}
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
//END OF HELPERFUNCTIONS
//=============================================================
//DBFUNTIONS

function register(req, res)
{
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
//END OF DBFUNTIONS


