const { prepareFlexFunction } = require(Runtime.getFunctions()[
    'common/helpers/function-helper'
].path);
const https = require('https');
const http = require('http');

const requiredParameters = [
    { key: 'conversationSid', purpose: 'ConversationSid for the media' },
    { key: 'mediaSid', purpose: 'MediaSid to fetch content for' }
];

/* Helper function to make HTTPS requests */
function makeHttpsRequest(url, headers = {}) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const options = {
            hostname: urlObj.hostname,
            path: urlObj.pathname + urlObj.search,
            method: 'GET',
            headers: headers
        };

        const req = https.request(options, (res) => {
            const chunks = [];

            res.on('data', (chunk) => {
                chunks.push(chunk);
            });

            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve({
                        buffer: Buffer.concat(chunks),
                        statusCode: res.statusCode,
                        headers: res.headers
                    });
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${Buffer.concat(chunks).toString()}`));
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}



exports.handler = prepareFlexFunction(requiredParameters, async (context, event, callback, response, handleError) => {
    console.log('[Serverless Functions] [Conversation History] [Flex] Fetching media content', {
        conversationSid: event.conversationSid,
        mediaSid: event.mediaSid
    });

    const client = context.getTwilioClient();
    const { conversationSid, mediaSid } = event;

    if (!conversationSid || !mediaSid) {
        response.setBody({ error: 'conversationSid and mediaSid are required' });
        response.setStatusCode(400);
        return callback(null, response);
    }

    try {
        const chatServiceSid = process.env.TWILIO_FLEX_CHAT_SERVICE_SID;
        const accountSid = client.accountSid;
        const authToken = client.password;

        if (!chatServiceSid) {
            throw new Error('TWILIO_FLEX_CHAT_SERVICE_SID environment variable not set');
        }

        console.log('[fetchMediaContent] Fetching media metadata from MCS');

        // Step 1: Get media metadata from MCS
        const mcsMetadataUrl = `https://mcs.us1.twilio.com/v1/Services/${chatServiceSid}/Media/${mediaSid}`;
        const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');

        const metadataResponse = await makeHttpsRequest(mcsMetadataUrl, {
            'Authorization': authHeader
        });

        console.log('[fetchMediaContent] Metadata received, parsing...');

        // Parse the JSON response
        const metadata = JSON.parse(metadataResponse.buffer.toString());

        console.log('[fetchMediaContent] Metadata:', {
            filename: metadata.filename,
            content_type: metadata.content_type,
            size: metadata.size,
            hasDirectUrl: !!metadata.links?.content_direct_temporary
        });

        // Step 2: Get the temporary download URL
        const directUrl = metadata.links?.content_direct_temporary;

        if (!directUrl) {
            throw new Error('No content_direct_temporary URL found in metadata');
        }

        console.log('[fetchMediaContent] Redirecting to temporary URL');

        // Redirect to the signed temporary URL
        response.setStatusCode(302);
        response.appendHeader('Location', directUrl);
        response.appendHeader('Access-Control-Allow-Origin', '*');

        callback(null, response);

    } catch (error) {
        console.error('[Serverless Functions] [Conversation History] [Flex] Error:', error);
        response.setStatusCode(500);
        response.setBody({
            success: false,
            error: error.message
        });
        callback(null, response);
    }
});
