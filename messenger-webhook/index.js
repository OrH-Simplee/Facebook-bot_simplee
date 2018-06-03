'use strict';

// Imports dependencies and set up http server
const
  express = require('express'),
  bodyParser = require('body-parser'),
  app = express().use(bodyParser.json()); // creates express http server
  
  var PROVIDER = "methodist";
  var accountId;
  var session;
  var state = -1;
  var logSuccess = false;




// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));
console.log("state is:" , state  )

// Creates the endpoint for our webhook 
app.post('/webhook', (req, res) => {  
 
  console.log('post');
  let body = req.body;

  // Checks this is an event from a page subscription
  if (body.object === 'page') {

    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {

      // Gets the message. entry.messaging is an array, but 
      // will only ever contain one message, so we get index 0
      let webhook_event = entry.messaging[0];

      let sender_psid = webhook_event.sender.id;
	  console.log('Sender PSID: ' + sender_psid);

	  if (webhook_event.message) {
   		 handleMessage(sender_psid, webhook_event.message);        
  	  } 
  	  else if (webhook_event.postback) {
    	handlePostback(sender_psid, webhook_event.postback);
  	  }
     

    });

    // Returns a '200 OK' response to all requests
    res.status(200).send('good');

    
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }

});

// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {

  console.log('get');
  //var b = get_payable_balance(res) 
  // Your verify token. Should be a random string.
  //let VERIFY_TOKEN = "<YOUR_VERIFY_TOKEN>"
  let VERIFY_TOKEN = "VERIFY_TOKEN"
  // Parse the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];


  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
  	console.log(mode)
  	console.log(mode === 'subscribe')
    console.log(token)
    console.log(token === VERIFY_TOKEN)

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

function handleMessage(sender_psid, received_message) {
  console.log("state:"+ state +" message:" + received_message.text)
  
  let response;
  let messageText = received_message.text.toLowerCase().trim();

  if (messageText == "exit")
    {
      response = "Thank you!";
      state = -1;
    }
  else if (state == -1)
  {
  	let wm = "Would you like to receive some quick information regarding your account in Methodist? (yes/no)";
    response = "Hi, \n\n" + wm;
    state = 0;
  }
  else if (state == 0)
  {
    if (messageText == "yes") 
    {
      response = "Please enter your Account or Guarantor ID";
      state = 1
    }
    else if (messageText == "no") 
    {
      response = "Please visit our page, to log in to your account: https://simplee.com/providers/methodist";
      state = -1;
    }
    else response = "Invalid answer, please enter yes/no";
  }
  else if (state == 1)
  {
    accountId = messageText;
    response = "What's your Date of Birth? (mm/dd/yyyy)";
    state = 2;
  }
  else if (state == 2)
  {
    let dob = messageText;
    let j = createJson (accountId ,dob,PROVIDER );
    createSession (j,PROVIDER, sender_psid);

    state = 3;
    return;
  }
  else if (state == 3)
  {
    response = "still waiting for account validation";
    
  }
  else if (state == 100)
  {
    if (messageText == "1")
    {
      getstandingamount (sender_psid, session,PROVIDER, accountId)
      state = 101;
      return;
    }
    else if (messageText == "2")
    {
      response = showVisitList();
    }
    else if (messageText == "3")
    {
      response = "not available yet, please re-enter";
    }
    else 
    {
      response = "Not a valid input, please re-enter"
    }
  }
  else if (state==101)
  {
    	response = "Please wait patiently"	
  }
  
    
  console.log("response:" + response) 
  
  // Sends the response message
  callSendAPI(sender_psid, response);    
}


function sendWelcomeMessage()
{
  return "bot : Hi Eitan, \
         Would you like to receive some quick information regarding your account in Gundersen? (yes/no)";

}



function showVisitList()
{
  return "Date: March 21, 2012 \nType: medical treatement \n\nDate: May 21, 2015 \nType: another treatement";
}


function handlePostback(sender_psid, received_postback) {
  let response;
  
  // Get the payload for the postback
  let payload = received_postback.payload;

  // Set the response based on the postback payload
  if (payload === 'yes') {
    response = { "text": "Thanks!" }
  } else if (payload === 'no') {
    response = { "text": "Oops, try sending another image." }
  }
  // Send the message to acknowledge the postback
  callSendAPI(sender_psid, response);
}


function callSendAPI(sender_psid, response) {
	console.log("start send")
	const request = require('request');
	var  PAGE_ACCESS_TOKEN = "EAAB8UmWbqZCABANIeGOmqGKWNwDAdIZC0cpY5olw4deKws9f6i93zIKODZCqH6DpKhnDoiTDVawue161tcbCLf3ReSaPoYnJhHBI9SYgN0AeFxl2HBelLbAlBZCsZBlWlvZATZB81FJwEUIuNbHn8v5B6nZAU0etaKsYvsICjTBi3AZDZD"
  	// Construct the message body
  	let request_body = {
    	"recipient": {
      		"id": sender_psid
    		},
    		"message":{ 
    			"text":response
    	}
  	}

  // Send the HTTP request to the Messenger Platform
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  },
   (err, res, body) => {
    if (!err) {
      console.log('message sent!')
    } else {
      console.error("Unable to send message:" + err);
    }
  }); 
}


function createJson (acc_num ,date_of_birth,provider )
{
	let json= {
	  "account_session": {
	      "payable": {
	        "account_number": acc_num,
	        "provider": provider
	      },
	      "password": {
	                "date_of_birth": date_of_birth
	      },
	      "term_accepted": "true"
	  }
	}
return json;
}


function createSession (json1,provider, PSID)
{
	var request = require('request');

	request.post ({
		headers: {'apitoken' : '6NRlCPWSgTIOU3ZPFCeclUpmy+Zkhb0nwnlswxMbqIGaIRQti4c93a6Zxmgp2PhaK',
				   'Content-Type' : 'application/json'},
		qs: { 
			'language' : 'en' ,
			'provider' : provider,
			'request_from' : 'consumer',
			'request_id':12345,
			'sso':true
			 },
		url:"http://127.0.0.1:3000/sessions_service/account_sessions.json",
		json: json1
	}, 
	function(error, response, body){
  		
  		
  		//console.log("response:", response);
  		if ( body["account_session"] && body["account_session"]["session_id"])
  		{
			console.log("body:", body["account_session"]["session_id"]);
			session = body["account_session"]["session_id"];
			logSuccess=true;

    		state = 100;
    		sendoptions(PSID);
		}
		else
			{
				state = 1
				callSendAPI(PSID , "Authentication failed, Please re-enter your account id")
			}
			

	});
}



function getstandingamount  (PSID, session,provider, acct)
{
	console.log("here");
	var request = require('request');

	request.get({
		headers: {'apitoken' : '6NRlCPWSgTIOU3ZPFCeclUpmy+Zkhb0nwnlswxMbqIGaIRQti4c93a6Zxmgp2PhaK',
				   'Content-Type' : 'application/json'},
		qs: { 
			'account_session_id' : session,
			'provider' : provider,
			'request_from' : 'consumer',
			'request_id':12345,
			'granularity' : 'standing_amount',
			'account_number' : acct
			 },
		url:"http://localhost:3000/payments_service/payables.json?",
	},
	function(error, response, body){
		let b = JSON.parse(body);
		if (b[0] && b[0]["payable"] && b[0]["payable"]["standing_amount"])
		 	{
		 		let res ="Your balance is:" + b[0]["payable"]["standing_amount"]/100 +"$";
		 		callSendAPI(PSID,res)
    			state = 100;
    			sendoptions(PSID);
    			
		 	}
		
	});
}

function sendoptions(PSID)
{
	let l1 = "For your current balance, Enter 1";
	let l2 = "For your last visit details, Enter 2";
	let l3 = "For your past visits please, Enter 3";
	let n="\n\n";
	let res = l1 +n + l2 +n +l3;
	callSendAPI(PSID , res);
}



