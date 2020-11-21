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

   /* Verify connection configuration */
  transporter.verify(function(error) {
    if (error) {
      console.log(error);
      console.log("Error equals true");
    } else {
      console.log("Server is ready");
    }
  });


   
  
  router.post('/api/contact', [
  
/* POST requirements to check before sending Email from express validator*/
  body('email').isEmail(),  // Email field needs to be a valid email @something.com etc
  body('customername').isLength({ min: 2}), // CustomerName field cant be less than 2 characters
  body('message').isLength({ min: 5 }) // Message field cant be less than 5 characters
  ], (req, res) => {
              
              const errors = validationResult(req);
              if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
              }
  
                const mailOption = {
                  from: `${req.body.email} <noreply@rosenvanteshop.se>`, // EndUser emailadress
                  to: config.user, // hardcoded send to adress
                  replyTo: `${req.body.email}`, // Config of "replyto" field sets the email adress from EndUser above
                  subject: `${req.body.customername}, ${req.body.product}`, //Subject of message sets to CustomerName
                  text: `${req.body.message}` // Message text field
                    }
  
  
                      transporter.sendMail(mailOption, (err, info ) => {
                      
                        tls: {
                          rejectUnauthorized: false // Fix from google, else mail got stucked by error messages
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
