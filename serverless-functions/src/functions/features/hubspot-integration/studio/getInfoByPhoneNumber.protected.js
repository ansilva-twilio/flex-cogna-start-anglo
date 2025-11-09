const { prepareStudioFunction, extractStandardResponse } = require(Runtime.getFunctions()[
    'common/helpers/function-helper'
].path);
const requiredParameters = [
    { key: 'phoneNumber', purpose: 'the phoneNumber to use to get info from CRM' }
];

exports.handler = prepareStudioFunction(requiredParameters, async (context, event, callback, response, handleError) => {
    try {
        const phoneNumber = event.phoneNumber?.replace('whatsapp:', '');

        // TODO: Get Info from Hubspot
        // Use context.HUBSPOT_ACCESS_TOKEN

        // mock data
        const result = {
            name: 'Gabriel Rocha',
            objectTypeId: '0-3',
            objectId: '48359177752',
            instanceId: '50090256'
        };

        response.setStatusCode(200);
        response.setBody(result);
        return callback(null, response);
    } catch (error) {
        return handleError(error);
    }
});
