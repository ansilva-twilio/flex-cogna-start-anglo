const { prepareFlexFunction, extractStandardResponse, twilioExecute } = require(Runtime.getFunctions()[
    'common/helpers/function-helper'
].path);

const requiredParameters = [
    { key: 'conversationSid', purpose: 'the conversation to be saved' },
    { key: 'contactId', purpose: 'the id of the contact to save the transcript to' },
    { key: 'contactName', purpose: 'the name of the contact to save the transcript to' }
];

function formatDate(isoString) {
    const date = new Date(isoString);

    // Convert UTC to GMT-3 manually
    const offsetDate = new Date(date.getTime() - 3 * 60 * 60 * 1000);

    const day = String(offsetDate.getUTCDate()).padStart(2, "0");
    const month = String(offsetDate.getUTCMonth() + 1).padStart(2, "0");
    const year = offsetDate.getUTCFullYear();

    const hours = String(offsetDate.getUTCHours()).padStart(2, "0");
    const minutes = String(offsetDate.getUTCMinutes()).padStart(2, "0");
    const seconds = String(offsetDate.getUTCSeconds()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

function formatAuthor(author, contactName, conversationSid) {
    let newAuthor = '';
    if (author != null) {
        newAuthor = author;
        if (author.startsWith(conversationSid)) {
            newAuthor = "Agente Virtual";
        } else if (author.startsWith('whatsapp')) {
            newAuthor = contactName;
        } else {
            newAuthor = `Agente (${author})`;
        }
    }
    return newAuthor;
}

function buildNote(messages, contactName, conversationSid) {
    let html =
        `<strong>📱 Conversa via WhatsApp (via Twilio Flex - ${conversationSid})</strong><br />` +
        `---<br /><br />` +
        `<strong>🗒️ Transcript:</strong><br /><br />`;

    messages.forEach(message => {
        html += `<strong>${formatAuthor(message.author, contactName, conversationSid)}</strong> (${formatDate(message.dateCreated)}): ${message.body}<br />`;
    });

    console.log('HTML', html);
    return html;
}

async function saveNoteToHubspot(noteBody, contactCRMId, hubspotAccessToken) {

    // 202 = Contact, 214 = Deal
    const associationTypeId = 202;
    const noteData = {
        properties: {
            hs_timestamp: new Date().toISOString(),
            hs_note_body: noteBody
        },
        associations: [
            {
                to: {
                    id: parseInt(contactCRMId)
                },
                types: [
                    {
                        associationCategory: 'HUBSPOT_DEFINED',
                        associationTypeId: associationTypeId
                    }
                ]
            }
        ]
    };

    console.log('Criando nota no HubSpot:', noteData);

    let config = {
        method: 'post',
        url: 'https://api.hubapi.com/crm/v3/objects/notes',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${hubspotAccessToken}`
        },
        data: JSON.stringify(noteData)
    };

    const response = await axios.request(config);

    console.log('Nota criada com sucesso:', response);
    return response;
}

exports.handler = prepareFlexFunction(requiredParameters, async (context, event, callback, response, handleError) => {
    try {
        const client = context.getTwilioClient();
        const hubspotAccessToken = context.HUBSPOT_ACCESS_TOKEN;

        const conversationSid = event.conversationSid;
        const contactName = event.contactName
        const contactId = event.contactId

        console.log("[Serverless Functions] [Save to Hubspot] [Flex] Saving conversation to Hubspot", conversationSid, contactId, contactName);

        const conversation = await client.conversations.v1.conversations(conversationSid);
        const messages = await conversation.messages.list();
        const noteBody = buildNote(messages, contactName, conversationSid);

        console.log("[Serverless Functions] [Save to Hubspot] [Flex] Note built", noteBody);

        const hubspotData = await saveNoteToHubspot(noteBody, contactId, hubspotAccessToken)?.data;
        const result = { success: true };

        console.log("[Serverless Functions] [Save to Hubspot] [Flex] Note Saved", hubspotData);

        response.setStatusCode(200);
        response.setBody(result);
        return callback(null, response);
    } catch (error) {
        console.log(error);
        return handleError(error);
    }
});
