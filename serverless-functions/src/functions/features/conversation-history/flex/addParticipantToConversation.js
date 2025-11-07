const { prepareFlexFunction, extractStandardResponse } = require(Runtime.getFunctions()[
  'common/helpers/function-helper'
].path);

const requiredParameters = [
  { key: 'conversationSid', purpose: 'ConversationSid to add participant to' },
  { key: 'address', purpose: 'The address to be added' },
];

/* This function is used to add a participant to a conversation before we close it, 
* so that the live chat session can be surfaced on the previous chat conversations
*/

//adds a messaging binding address (phone number) to an existing conversation
async function addParticipant(client, conversationSid, address) {
  //need to check if this is a phone number, otherwise we might invoke this with a chat identity 
  if (!address.startsWith('+')) {
    console.log("the address (phone number) provided does not start with a +. Address provided: ", address)
    return;
  }
  const addParticipant = await client.conversations.v1.conversations(conversationSid)
    .participants
    .create({
      'messagingBinding.address': address
    });
  console.log(addParticipant.sid);
}

exports.handler = prepareFlexFunction(requiredParameters, async (context, event, callback, response, handleError) => {

  console.log("[Serverless Functions] [Conversation History] [Flex] Adding participant to conversation", event.conversationSid, event.address);

  const client = context.getTwilioClient();
  var conversationSid = event.conversationSid;
  var address = event.address;

  //validate if parameters are missing
  if (!conversationSid || !address) {
    response.setBody(JSON.parse(`{"error": "malformed request"}`));
    response.setStatusCode(200);
    return callback(null, response);
  }

  const resp = await addParticipant(client, conversationSid, address);
  var data = { sucess: true, data: resp };
  response.setStatusCode(200);

  if (typeof data !== 'undefined') {
    response.setBody(data);
  }
  else {
    response.setBody(JSON.parse(`{"success": false}`));
  }

  console.log("[Serverless Functions] [Conversation History] [Flex] Added participant to conversation", response);
  return callback(null, response);
});
