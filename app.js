const express = require('express')
const request = require('request')
const app = express()
const bodyParser = require('body-parser')


app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.get('/', (req, res) => {
    res.send(`Hello World.`)
})

app.get('/webhook', function(req, res) {
    if (req.query['hub.mode'] === 'subscribe' &&
        req.query['hub.verify_token'] === "kevin_is_my_assis") {
      console.log("Validating webhook");
      res.status(200).send(req.query['hub.challenge']);
    } else {
      console.error("Failed validation. Make sure the validation tokens match.");
      res.sendStatus(403);          
    }  
})

app.post('/webhook', function (req, res) {
    var data = req.body;
  
    // Make sure this is a page subscription
    if (data.object === 'page') {
  
      // Iterate over each entry - there may be multiple if batched
      data.entry.forEach(function(entry) {
        var pageID = entry.id;
        var timeOfEvent = entry.time;
  
        // Iterate over each messaging event
        entry.messaging.forEach(function(event) {
          if (event.message) {
            receivedMessage(event);
          } else {
            console.log("Webhook received unknown event: ", event);
          }
        });
      });
  
      // Assume all went well.
      //
      // You must send back a 200, within 20 seconds, to let us know
      // you've successfully received the callback. Otherwise, the request
      // will time out and we will keep trying to resend.
      res.sendStatus(200);
    }
});
    
function receivedMessage(event) {
    // Putting a stub for now, we'll expand it in the following steps
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfMessage = event.timestamp;
    var message = event.message;

    console.log("Received message for user %d and page %d at %d with message:", 
    senderID, recipientID, timeOfMessage);
    console.log(JSON.stringify(message));

    var messageId = message.mid;

    var messageText = message.text;
    var messageAttachments = message.attachments;

    if (messageText) {

    // If we receive a text message, check to see if it matches a keyword
    // and send back the example. Otherwise, just echo the text we received.
    switch (messageText) {
        case 'generic':
        sendGenericMessage(senderID);
        break;

        default:
        sendTextMessage(senderID, messageText);
    }
    } else if (messageAttachments) {
        sendTextMessage(senderID, "Message with attachment received");
    }
}

function sendGenericMessage(recipientId, messageText) {
    // To be expanded in later sections
}

function sendTextMessage(recipientId, messageText) {
    var messageData = {
      recipient: {
        id: recipientId
      },
      message: {
        text: messageText
      }
    };
  
    callSendAPI(messageData);
}

function callSendAPI(messageData) {
    request({
      uri: 'https://graph.facebook.com/v2.6/me/messages',
      qs: { access_token: "EAACahD5rRjkBAImH5LwtTJ4yNJ5UQaEjj6dAo6B8geK8YJfC0kGbZAPu5HyatI4ghgsZBNWWALzZAOoTXsbRLKdX3DNklFElV76r5neXkMESCZCtjELRHHQIOiHw9RmRQLNDoEMAra3YHCfy7ZCVzDshw2ShEfqe2e4VGQq7j7wZDZD" },
      method: 'POST',
      json: messageData
  
    }, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var recipientId = body.recipient_id;
        var messageId = body.message_id;
  
        console.log("Successfully sent generic message with id %s to recipient %s", 
          messageId, recipientId);
      } else {
        console.error("Unable to send message.");
        console.error(response);
        console.error(error);
      }
    });  
}

app.listen(3000, () => {
    console.log('run on port 3000')
})