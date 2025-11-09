const { prepareFlexFunction, extractStandardResponse, twilioExecute } = require(Runtime.getFunctions()[
    'common/helpers/function-helper'
].path);

const requiredParameters = [
    { key: 'conversationSid', purpose: 'the conversation to be saved' },
];

exports.handler = prepareFlexFunction(requiredParameters, async (context, event, callback, response, handleError) => {
    try {
        const conversationSid = event.conversationSid;
        const result = {};

        //const conversation = await manager.conversationsClient.getConversationBySid(conversationSid);
        //const messages = (await conversation.getMessages())?.items.map(m => { m.author, m.body, m.contentSid, m.dateCreated, m.dateUpdated, m.type });

        // TODO: build object to be saved
        // TODO: save object in Hubspot

        response.setStatusCode(200);
        response.setBody(result);
        return callback(null, response);
    } catch (error) {
        return handleError(error);
    }
});
