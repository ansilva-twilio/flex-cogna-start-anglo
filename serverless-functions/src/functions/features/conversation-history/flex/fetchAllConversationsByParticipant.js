const { prepareFlexFunction, extractStandardResponse } = require(Runtime.getFunctions()[
  'common/helpers/function-helper'
].path);

const requiredParameters = [
  { key: 'phoneNumber', purpose: 'Phone number to fetch conversations for' }
];

/* Fetches all conversations by a participant.
* The participant is either a phone number i.e. +447123123123 or a whatsapp:+447123123123 and then we bundle them together
* If the participant is a chat participant, the chat is being tied to a from address //TODO MODIFIED FROM?
*/

const MAX_CONVERSATIONS_TO_FETCH = 100;
const MAX_CONVERSATIONS_TO_PRESENT = 20;
const MAX_PERIOD = 12;

/* Returns the conversations list in order. 
** Applies filter startDate > date, where date is at a maximum the MAX_PERIOD */
async function getAllConversationsList(client, fromAddress){
    var newDate = MAX_PERIOD;
    var result = [];

    //if the original fromAddress is a WhatsApp we need to swap it around
    if(fromAddress.startsWith('whatsapp:')){
      fromAddressWA = fromAddress;
      fromAddress = fromAddress.slice(9);
    }

    var fromAddressWA = 'whatsapp:'+fromAddress;

    //fetch conversations with filters
    const conversationsListNumber = await client
        .conversations
        .v1
        .participantConversations
        .list({address: fromAddress, startDate: newDate, limit: MAX_CONVERSATIONS_TO_FETCH})

    //fetch conversations with filters
    const conversationsListWA = await client
        .conversations
        .v1
        .participantConversations
        .list({address: fromAddressWA, startDate: newDate, limit: MAX_CONVERSATIONS_TO_FETCH})

    //sort by date created 
    var conversationsList = conversationsListNumber.concat(conversationsListWA);
    
    conversationsList.sort((a, b) => new Date(b.conversationDateCreated) - new Date(a.conversationDateCreated));  
    
    //remove those that are not to be presented
    if(MAX_CONVERSATIONS_TO_FETCH > MAX_CONVERSATIONS_TO_PRESENT){
      conversationsList
        .splice(MAX_CONVERSATIONS_TO_PRESENT, MAX_CONVERSATIONS_TO_FETCH - MAX_CONVERSATIONS_TO_PRESENT);
    }
    
    //create a result object with the information we want to supply
    for await (const conversation of conversationsList){
      //this will identify whatsapps as whatsapp, sms and chat as sms (because we're adding a messaging binding to chats)
      let originalChannel = conversation.participantMessagingBinding.type;
      //if the proxy comes out null, it was originally a chat
      if (originalChannel === 'sms'){
        if (!conversation.participantMessagingBinding.proxy_address){
          originalChannel = 'chat';
        }
      }
      let convo = JSON.parse(`{
        "conversationOriginalChannel": "${originalChannel}",
        "conversationSid": "${conversation.conversationSid}", 
        "conversationDateCreated": "${conversation.conversationDateCreated}",
        "conversationState": "${conversation.conversationState}",
        "from": "${conversation.participantMessagingBinding.address}"
        }`);
      result.push(convo);
    }
    return result;
}

exports.handler = prepareFlexFunction(requiredParameters, async (context, event, callback, response, handleError) => {

  console.log("[Serverless Functions] [Conversation History] [Flex] Fetching all conversations by participant", event.phoneNumber);

  const client = context.getTwilioClient();
  var phoneNumber = '';
  var startDateOffset = MAX_PERIOD;

  //validate if a number has been provided
  if (event.phoneNumber) {
    phoneNumber = event.phoneNumber;
  }
  else {
    response.setBody(JSON.parse(`{"error": "no number provided"}`));
    response.setStatusCode(200);
    return callback(null, response);
  }

  const request = await getAllConversationsList(client, phoneNumber, startDateOffset).then( function(resp) {
    var data = { sucess: true, data: resp };
    response.setStatusCode(200);

    if(typeof data !== 'undefined'){
      response.setBody(data);
    }
    else {
      response.setBody(JSON.parse(`{"sucess": false }`));
    }
    
    console.log("[Serverless Functions] [Conversation History] [Flex] Done fetching all conversations by participant", event.phoneNumber);
    return callback(null, response);
  })
});