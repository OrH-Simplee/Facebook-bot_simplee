
'use strict';

// Imports dependencies and set up http server
const
  express = require('express'),
  bodyParser = require('body-parser'),
  app = express().use(bodyParser.json()); // creates express http server

var session
let j = createJson ("354250", "01/20/2038", "methodist");
console.log(j);
createSession(j , "methodist");





function createSession (json1,provider)
{
	var request = require('request');
	let sessions_id;

	let x = request.post ({
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
				session = body["account_session"]["session_id"]
				console.log("body:", body["account_session"]["session_id"]);
				getstandingamount(session, provider, "354250" );
			}
		else
			console.log("failed");

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



function getstandingamount  (session,provider, acct)
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
		 		let res ="Your balance is:" + b[0]["payable"]["standing_amount"];
		 		callSendAPI(sender_psid,res)
		 	}
		
	});

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
