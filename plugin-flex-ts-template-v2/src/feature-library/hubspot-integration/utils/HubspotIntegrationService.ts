import * as Flex from '@twilio/flex-ui';

import ApiService from '../../../utils/serverless/ApiService';
import { EncodedParams } from '../../../types/serverless';

export interface HubspotIntegrationServiceResponse {
    success: boolean;
}

class HubspotIntegrationService extends ApiService {

    async saveConversation(conversationSid: string, contactId: string, contactName: string): Promise<HubspotIntegrationServiceResponse> {
        const manager = Flex.Manager.getInstance();

        const encodedParams: EncodedParams = {
            Token: encodeURIComponent(manager.user.token),
            conversationSid: encodeURIComponent(conversationSid),
            contactId: encodeURIComponent(contactId),
            contactName: encodeURIComponent(contactName)
        };

        return this.fetchJsonWithReject<HubspotIntegrationServiceResponse>(
            `${this.serverlessProtocol}://${this.serverlessDomain}/features/hubspot-integration/flex/saveConversationToCRM`,
            {
                method: 'post',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: this.buildBody(encodedParams),
            },
        ).then((response): HubspotIntegrationServiceResponse => {
            return {
                success: response.success
            };
        });
    }
}

export default new HubspotIntegrationService();