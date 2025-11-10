const axios = require('axios');
const { prepareStudioFunction, extractStandardResponse } = require(Runtime.getFunctions()[
    'common/helpers/function-helper'
].path);
const requiredParameters = [
    { key: 'phoneNumber', purpose: 'the phoneNumber to use to get info from Hubspot' }
];

exports.handler = prepareStudioFunction(requiredParameters, async (context, event, callback, response, handleError) => {
    try {
        const phoneNumber = event.phoneNumber?.replace('whatsapp:', '');
        const hubspotAccessToken = context.HUBSPOT_ACCESS_TOKEN;

        console.log("[Serverless Functions] [Get Info] [Studio] Retrieving information from Hubspot for", phoneNumber);

        let data = JSON.stringify({
            "filterGroups": [
                {
                    "filters": [
                        {
                            "propertyName": "phone",
                            "operator": "CONTAINS_TOKEN",
                            "value": phoneNumber
                        }
                    ]
                }
            ]
        });

        console.log("[Serverless Functions] [Get Info] [Studio] Request data", data);

        let config = {
            method: 'post',
            url: 'https://api.hubspot.com/crm/v3/objects/contacts/search',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${hubspotAccessToken}`
            },
            data: data
        };

        const hs_response = await axios.request(config);
        console.log("[Serverless Functions] [Get Info] [Studio] Response", hs_response);

        const result = {
            success: false,
            data: {
                name: `Não identificado (${phoneNumber})`,
                objectTypeId: '0-1',
                objectId: '0',
                instanceId: '50090256'
            }
        };

        if (hs_response && hs_response.data && hs_response.data.results && hs_response.data.total > 0) {
            const contact = hs_response.data.results[0];
            result.data.name = `${contact.properties?.firstname} ${contact.properties?.lastname}`;
            result.data.objectId = contact.id;
            result.success = true;
            console.log('[Serverless Functions] [Get Info] [Studio] Contact successfully found');
        } else {
            console.log('[Serverless Functions] [Get Info] [Studio] Contact not found');
        }

        console.log('[Serverless Functions] [Get Info] [Studio] Result', result);

        response.setStatusCode(200);
        response.setBody(result);
        return callback(null, response);
    } catch (error) {
        console.log('[Serverless Functions] [Get Info] [Studio] Error', error);
        return handleError(error);
    }
});
