const { prepareStudioFunction, extractStandardResponse } = require(Runtime.getFunctions()[
    'common/helpers/function-helper'
].path);
const requiredParameters = [
    { key: 'phoneNumber', purpose: 'the phoneNumber to use to get info from CRM' }
];

exports.handler = prepareStudioFunction(requiredParameters, async (context, event, callback, response, handleError) => {
    try {
        const phoneNumber = event.phoneNumber;
        const result = '';

        response.setStatusCode(200);
        response.setBody({ ...extractStandardResponse(result) });
        return callback(null, response);
    } catch (error) {
        return handleError(error);
    }
});
