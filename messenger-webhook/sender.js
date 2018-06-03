


function callSendAPI(sender_psid, response) {
	const request = require('request');

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




curl -X POST -H "Content-Type: application/json" -d 
'{
  "recipient":{
    "id":"1527442627361215"
  },
  "message":{
    "text":"your balance is"
  }
}' 
"https://graph.facebook.com/v2.6/me/messages?access_token=EAAB8UmWbqZCABANIeGOmqGKWNwDAdIZC0cpY5olw4deKws9f6i93zIKODZCqH6DpKhnDoiTDVawue161tcbCLf3ReSaPoYnJhHBI9SYgN0AeFxl2HBelLbAlBZCsZBlWlvZATZB81FJwEUIuNbHn8v5B6nZAU0etaKsYvsICjTBi3AZDZD"






post request to localhost:3001/sessionservice
Headers:
1: 
json:

params:

language: en
provider: 
request_from: consumer
request_id: 