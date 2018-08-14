'use strict';

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

const https = require('https');


// const axios = require('axios');


const request = require('request');

// Imports dependencies and set up http server
const
  bodyParser = require('body-parser'),
  request = require('request');


module.exports = (app) => {

  app.use(bodyParser.json());
  // Creates the endpoint for our webhook 
  app.post('/webhook', (req, res) => {  

    let body = req.body;

    // Checks this is an event from a page subscription
    if (body.object === 'page') {

      // Iterates over each entry - there may be multiple if batched
      body.entry.forEach(function(entry) {

        // Gets the message. entry.messaging is an array, but 
        // will only ever contain one message, so we get index 0
        // Gets the body of the webhook event
        let webhook_event = entry.messaging[0];

        // Get the sender PSID
        let sender_psid = webhook_event.sender.id;
        // console.log('Sender PSID: ' + sender_psid);

        getUserInfo(sender_psid);

        // Check if the event is a message or postback and
        // pass the event to the appropriate handler function
        if (webhook_event.message) {
          handleMessage(sender_psid, webhook_event.message);        
        } else if (webhook_event.postback) {
          handlePostback(sender_psid, webhook_event.postback);
        }

      });

      // Returns a '200 OK' response to all requests
      res.status(200).send('EVENT_RECEIVED');
    } else {
      // Returns a '404 Not Found' if event is not from a page subscription
      res.sendStatus(404);
    }

  });

  // Adds support for GET requests to our webhook
  app.get('/webhook', (req, res) => {

    // Your verify token. Should be a random string.
    const VERIFY_TOKEN = "HIO7eLI35k"
      
    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];
      
    // Checks if a token and mode is in the query string of the request
    if (mode && token) {
    
      // Checks the mode and token sent is correct
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        
        // Responds with the challenge token from the request
        console.log('WEBHOOK_VERIFIED');
        res.status(200).send(challenge);
      
      } else {
        // Responds with '403 Forbidden' if verify tokens do not match
        res.sendStatus(403);      
      }
    }
  });


  // Handles messages events
  function handleMessage(sender_psid, received_message) {

    let response;
    // Check if the message contains text
    if (received_message.text) {

      if (received_message.nlp.entities.hasOwnProperty('intent')) {

        let intent = received_message.nlp.entities.intent[0].value;
        let confidence = received_message.nlp.entities.intent[0].confidence;

        if (intent === 'greeting' && confidence > 0.8)  {
          response = {
            "text": `Hi, It's there! how can I help you?`
          }
        } else if (intent === 'account' && confidence > 0.8) {
          let webUrl = 'https://mohaimin.herokuapp.com/form';
          response = {
            attachment: {
                type: "template",
                payload: {
                    template_type: "button",
                    text: "OK, let's set your room preferences so I won't need to ask for them in the future.",
                    buttons: [{
                        type: "web_url",
                        url: webUrl,
                        title: "Set preferences",
                        webview_height_ratio: "compact",
                        messenger_extensions: true
                    }]
                }
            }
          }
        } else {
          response = {
            "text": "Sorry, couldn't understand you"
          }
        }
      } else {
        response = {
          "text": "Sorry, couldn't understand you"
        }
      }
      
    }  else if (received_message.attachments) {
    
      // Gets the URL of the message attachment
      let attachment_url = received_message.attachments[0].payload.url;
      response = {
        "attachment": {
          "type": "template",
          "payload": {
            "template_type": "generic",
            "elements": [{
              "title": "Is this the right picture?",
              "subtitle": "Tap a button to answer.",
              "image_url": attachment_url,
              "buttons": [
                {
                  "type": "postback",
                  "title": "Yes!",
                  "payload": "yes",
                },
                {
                  "type": "postback",
                  "title": "No!",
                  "payload": "no",
                }
              ],
            }]
          }
        }
      }
    } 

    
    // Sends the response message
    callSendAPI(sender_psid, response);    
  }

  // Handles messaging_postbacks events
  function handlePostback(sender_psid, received_postback) {
    let response;
    
    // Get the payload for the postback
    let payload = received_postback.payload;

    // Set the response based on the postback payload
    if (payload === 'yes') {
      response = { "text": "Okay, we'll proceed to the registraton" }
    } else if (payload === 'no') {
      response = { "text": "Oh, do you want a specific set of commands to choose from?" }
    }
    // Send the message to acknowledge the postback
    callSendAPI(sender_psid, response);
  }

  // Sends response messages via the Send API
  function callSendAPI(sender_psid, response) {
    // Construct the message body
    let request_body = {
      "recipient": {
        "id": sender_psid
      },
      "message": response
    }

    // Send the HTTP request to the Messenger Platform
    request({
      "uri": "https://graph.facebook.com/v2.6/me/messages",
      "qs": { "access_token": PAGE_ACCESS_TOKEN },
      "method": "POST",
      "json": request_body
    }, (err, res, body) => {
      if (!err) {
        console.log('message sent!')
      } else {
        console.error("Unable to send message:" + err);
      }
    });
  }

  let getUserInfo = (psid) => {
    // Send the HTTP request to the Messenger Platform
    let url = "https://graph.facebook.com/" + psid + "?fields=first_name,last_name,profile_pic" + "&access_token=" + PAGE_ACCESS_TOKEN;
    console.log(url);
    // Send the HTTP request to the Messenger Platform
    // https.get(url, (resp) => {
    //   let data = '';

    //   // A chunk of data has been recieved.
    //   resp.on('data', (chunk) => {
    //     data += chunk;
    //   });

    //   // The whole response has been received. Print out the result.
    //   resp.on('end', () => {
    //     console.log(data.last_name);
    //   });

    // }).on("error", (err) => {
    //   console.log("Error: " + err.message);
    // });

      // axios.get(url)
      // .then(response => {
      //   console.log(response.data.url);
      //   console.log(response.data.explanation);
      // })
      // .catch(error => {
      //   console.log(error);
      // });

      request(url, { json: true }, (err, res, body) => {
        if (err) { return console.log(err); }
        console.log(body.url);
        console.log(body.explanation);
      });

  }


  app.get('/show-buttons', (req, res) => {
    res.json({});
  });

  app.get('/get-webview', (req, res) => {
    res.render('form');
  });

  app.post('/broadcast-to-chatbot', (req, res) => {
     
  })

}
