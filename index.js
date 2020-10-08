const { response } = require('express')
const express = require('express')
const https = require('https');
const createUserJson = require('./createUser');
const app = express()
const createUser = require('./createUser');
var fs = require('fs');
const port = 3000;
app.use(express.static(__dirname + '/website'));


process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;


process.env.PORT = 3000;
process.env.IP = '10.0.2.6';

app.listen(process.env.PORT,  process.env.IP, startHandler())

function startHandler()
{
  console.log(`Server listening at http://${process.env.IP}:${process.env.PORT}; started at ${time()}`);
}




app.get('/', (req, res) => {
  res.writeHead(200, {'Content-Type': 'text/html'});
  var index = fs.readFileSync('website/index.html');
  res.end(index);
})
app.get('/isalive', (req, res) => {
  res.send("Yes the Server is Alive.")
})

app.get('/createaccount', (req, res) => {
  res.writeHead(200, {'Content-Type': 'text/html'});
  var index = fs.readFileSync('website/createaccount.html');
  res.end(index);
})



app.get('/newuser', (req, res) => {
  
  //res.send('NEW USER REQUEST RECIEVED');
  console.log("/newuser has been pinged with the following data:")
  console.log(req.query);  
  
  createUser.psNewUser(req.query);

  res.send(`Request Received. Sent New User Request to the server`);
  
 
  
})


app.get('/vpn',(req,res)=>{

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
