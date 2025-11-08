import * as Flex from '@twilio/flex-ui';

import { FlexEvent } from '../../../../types/feature-loader';
import HubspotIntegrationService from '../../../hubspot-integration/utils/HubspotIntegrationService';

export const eventName = FlexEvent.taskCompleted;
export const eventHook = async function sendDataToHubspot(flex: typeof Flex, manager: Flex.Manager, task: Flex.ITask) {
    const conversationSid = task?.attributes?.conversationSid;
    if (conversationSid) {
        await HubspotIntegrationService.saveConversation(conversationSid);
    }
};