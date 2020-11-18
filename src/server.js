const express = require('express');
const nodemailer = require('nodemailer')
const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');
const config = require('./config');
const { google } = require("googleapis");
require('dotenv').config()
const OAuth2 = google.auth.OAuth2;



const app = express();
const router = express.Router();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}))


const oauth2Client = new OAuth2(
    config.clientId, // ClientID
    config.clientSecret, // Client Secret
    "https://developers.google.com/oauthplayground" // Redirect URL
  );
  oauth2Client.setCredentials({
    refresh_token: config.refreshToken
  });
  const accessToken = oauth2Client.getAccessToken();
  
  console.log("Before transporter");
  
  let transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      type: 'OAuth2',
      accessToken: accessToken,
      ...config
      
    }
    
  });
  
  console.log("After transporter");
  // verify connection configuration
  transporter.verify(function(error, success) {
    if (error) {
      console.log(error);
      console.log("Error equals true");
    } else {
      console.log("Server is ready to take our messages");
    }
  });


   
  
  router.post('/api/contact', [
  
    
  body('email').isEmail(),
  body('customername').isLength({ min: 2}),
  body('message').isLength({ min: 5 })
  ], (req, res) => {
              // Finds the validation errors in this request and wraps them in an object with handy functions
              const errors = validationResult(req);
              if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
              }
  
                const mailOption = {
                  from: `${req.body.email} <noreply@rosenvanteshop.se>`, // sender address
                  to: config.user,
                  replyTo: `${req.body.email}`,
                  subject: `${req.body.customername}`,
                  text: `${req.body.message}`
                    }
  
  
                      transporter.sendMail(mailOption, (err, info ) => {
                      
                        tls: {
                          rejectUnauthorized: false
                        }
                        if (err) 
                        {
                          res.send('failure' + info)
                        }
                        else {
                                                      
                         return res.redirect('/success')
                        }
                          
  
                      });
                      
  
  
           });



app.use('/.netlify/functions/server', router); // path must route to lambda
module.exports = app;
module.exports.handler = serverless(app);
