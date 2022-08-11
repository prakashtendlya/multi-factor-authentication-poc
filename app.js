const config = require("./config");

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

const Nexmo = require('nexmo');

const nexmo = new Nexmo({
  apiKey: config.API_KEY,
  apiSecret: config.API_SECRET
});


var app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//request for OTP 

app.get('/register', (req, res) => {

  //getting number and message parameters as query
  let phoneNumber = req.query.number;
  let message = req.query.message;
  
  console.log(phoneNumber);

  // sending request with number and brand
  nexmo.verify.request({number: phoneNumber, brand: message}, (err, result) => {
    if(err) { 
      var temp = {
        "data" : null,
        "status" : false,
        "message" : "Server Error",
        "error" : err
      }
      res.json(temp);
    } else {
      console.log(result);
      let requestId = result.request_id;
      if(result.status == '0') {
        var temp = {
          "data" : {requestId : requestId},
          "status" : true,
          "message" : "OTP Sent Successfully!",
          "error" : null
        }
        res.json(temp);
      } else {
        var temp = {
          "data" : null,
          "status" : false,
          "message" : "error",
          "error" : result.error_text
        }
        res.json(temp);
      }
    }
  });
});

//Verification of OTP

app.get('/confirm', (req, res) => {

  //getting number and message parameters as query
  let pin = req.query.pin;
  let requestId = req.query.requestId;

  console.log('value of requestid in verify post handler is ' + requestId);

  // Checking to see if the code matches
  nexmo.verify.check({request_id: requestId, code: pin}, (err, result) => {
    if(err) {
      var temp = {
      "data" : null,
      "status" : false,
      "message" : "Server Error",
      "error" : err
    }
      res.json(temp);
    } else {
      console.log(result);
      if(result && result.status == '0') {
        var temp = {
          "data" : null,
          "status" : true,
          "message" : "OTP Verification Successful!",
          "error" : null
        }
        res.json(temp);  
      } else {
        var temp = {"message" : result.error_text, requestId: requestId}
        console.log("requestId" + requestId);
        var temp = {
          "data" : null,
          "status" : false,
          "message" : "Verification Failed!",
          "error" : result.error_text
        }
        res.json(temp);
      }
    }
  });
});

const server = app.listen(5000, () => {
  console.log('Express server listening on port %d', server.address().port);
});

module.exports = app;
