const { prepareFlexFunction, extractStandardResponse } = require(Runtime.getFunctions()[
  'common/helpers/function-helper'
].path);

const requiredParameters = [
  { key: 'conversationSid', purpose: 'ConversationSid to fetch messages for' }
];

const MAX_MESSAGES_TO_FETCH = 100;

/* Returns the messages within a given conversation */
async function getConversationMessages(client, conversationSid) {

  var messages = await client.conversations.v1.conversations(conversationSid)
    .messages
    .list({ limit: MAX_MESSAGES_TO_FETCH })

  console.log('found messages= ', messages.length);

  const result = messages.map(m => ({
    index: m.index,
    author: m.author,
    body: m.body,
    media: m.media != null ? JSON.stringify(m.media) : null,
    dateCreated: m.dateCreated
  }));

  return result;
}

exports.handler = prepareFlexFunction(requiredParameters, async (context, event, callback, response, handleError) => {

  console.log("[Serverless Functions] [Conversation History] [Flex] Fetching conversation messages", event.conversationSid);

  const client = context.getTwilioClient();
  var conversationSid = event.conversationSid;

  if (!conversationSid) {
    response.setBody(JSON.parse(`{"error": "no conversationSid provided"}`));
    response.setStatusCode(200);
    return callback(null, response);
  }

  const resp = await getConversationMessages(client, conversationSid);
  var data = { sucess: true, data: resp };
  response.setStatusCode(200);

  if (typeof data !== 'undefined') {
    response.setBody(data);
  }
  else {
    response.setBody(JSON.parse(`{ "sucess": false }`));
  }

  console.log("[Serverless Functions] [Conversation History] [Flex] Done fetching conversation messages", event.conversationSid);
  callback(null, response);
});