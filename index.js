const request = require('request');
const FACEBOOK_GRAPH_API_BASE_URL = "https://graph.facebook.com/v2.6/me/messages";

'use strict';

// Imports dependencies and set up http server 
const
  express = require('express'),
  bodyParser = require('body-parser'),
  app = express().use(bodyParser.json()); // creates express http server

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));

// Creates the endpoint for our webhook 
app.post('/webhook', (req, res) => {  
 
  let body = req.body;

  // Checks this is an event from a page subscription
  if (body.object === 'page') {

    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {

      // Gets the message. entry.messaging is an array, but 
      // will only ever contain one message, so we get index 0
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);

      // Get the sender PSID
      let sender_psid = webhook_event.sender.id;
      console.log('Sender PSID: ' + sender_psid);
        
      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhook_event.postback) {
        handlePostback(sender_psid, webhook_event.postback);
      } else if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);        
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
  let VERIFY_TOKEN = "sfjvlsnvsf20efoJ"
    
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

  var payload = received_message.quick_reply.payload;
  // Check if the message contains text

  // FIRST BRANCH: website tabs
  if (payload === 'WEBSITE') {
    response = {
      "text": "Which site would you like to view?",
      "quick_replies":[
        {
          "content_type":"text",
          "title":"Travels",
          "payload": 'TRAVELS'
        },
        {
          "content_type":"text",
          "title":"Guides",
          "payload": 'GUIDES'
        },
        {
          "content_type":"text",
          "title":"Services",
          "payload": 'SERVICES'
        },
        {
          "content_type":"text",
          "title":"About Me",
          "payload": 'ABOUT'
        }
      ]
    }  
  }
  // talk to jason 
  else if (payload === 'TALK') {
    response = { "text": "Jason will be with you shortly!" }
  }
  // SECOND BRANCH: travels
  else if (paid === 'TRAVELS') {
    response = {
      "attachment":{
        "type":"template",
        "payload":{
          "template_type":"button",
          "text":"Check out my recent travels!",
          "buttons":[
            {
              "type":"web_url",
              "url":"https://www.neverendingcycle.org/travels.html",
              "title":"Travels"
            }
          ]
        }
      }
    }
  }
  // guides
  else if (payload === 'GUIDES') {
    response = {
      "attachment":{
        "type":"template",
        "payload":{
          "template_type":"button",
          "text":"Check out my guides!",
          "buttons":[
            {
              "type":"web_url",
              "url":"https://www.neverendingcycle.org/guides.html",
              "title":"Guides"
            }, 
            {
              "type":"web_url",
              "url":"https://www.neverendingcycle.org/",
              "title":"Coming Soon!"
            }
          ]
        }
      }
    }
  }
  // services
  else if (payload === 'SERVICES') {
    response = {
      "attachment":{
        "type":"template",
        "payload":{
          "template_type":"button",
          "text":"Let me plan your next trip!",
          "buttons":[
            {
              "type":"web_url",
              "url":"https://www.neverendingcycle.org/travel-consultant.html",
              "title":"Travel Consultant"
            }
          ]
        }
      }
    }
  }  // about me
  else if (payload === 'ABOUT') {
    response = {
      "attachment":{
        "type":"template",
        "payload":{
          "template_type":"button",
          "text":"My story!",
          "buttons":[
            {
              "type":"web_url",
              "url":"https://www.neverendingcycle.org/about-me.html",
              "title":"About me"
            },
            {
              "type":"web_url",
              "url":"https://www.instagram.com/jasontsao/",
              "title":"IG"
            },
            {
              "type":"web_url",
              "url":"https://www.linkedin.com/in/jasontsao58/",
              "title":"LinkedIn"
            }
          ]
        }
      }
    }
  }
  else {
    response = { "text": "Jason will be with you shortly!" }

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
  // Greetings
  if (payload === 'GREETING') {
    const message = "Hello, hope you are having a good day! How can I help you today?";
    response = {
      "text": message,
      "quick_replies":[
        {
          "content_type":"text",
          "title":"Browse the website",
          "payload": 'WEBSITE'
        },
        {
          "content_type":"text",
          "title":"Talk to Jason",
          "payload": 'TALK'
        }
      ]
    }
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
    "uri": FACEBOOK_GRAPH_API_BASE_URL,
    "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN },
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
