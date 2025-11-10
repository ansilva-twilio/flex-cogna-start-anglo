const axios = require('axios');
const { prepareStudioFunction, extractStandardResponse } = require(Runtime.getFunctions()[
    'common/helpers/function-helper'
].path);
const requiredParameters = [
    { key: 'phoneNumber', purpose: 'the phoneNumber to use to get info from CRM' }
];

exports.handler = prepareStudioFunction(requiredParameters, async (context, event, callback, response, handleError) => {
    try {
        const phoneNumber = event.phoneNumber?.replace('whatsapp:', '');

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

        let config = {
            method: 'post',
            url: 'https://api.hubspot.com/crm/v3/objects/contacts/search',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${context.HUBSPOT_ACCESS_TOKEN}`
            },
            data: data
        };

        const response = await axios.request(config)?.data;
        const result = {
            name: `Não identificado (${phoneNumber})`,
            objectTypeId: '0-1',
            objectId: '0',
            instanceId: '50090256'
        };

        if (response && response.results && response.results.length > 0) {
            const contact = response.results[0];
            result.name = `${contact.properties?.firstname} ${contact.properties?.lastname}`;
            result.objectId = contact.id;
        }

        console.log(JSON.stringify(response.data));

        response.setStatusCode(200);
        response.setBody(result);
        return callback(null, response);
    } catch (error) {
        return handleError(error);
    }
});
