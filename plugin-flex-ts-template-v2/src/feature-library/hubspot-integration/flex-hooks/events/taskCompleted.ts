import * as Flex from '@twilio/flex-ui';

import { FlexEvent } from '../../../../types/feature-loader';
import HubspotIntegrationService from '../../../hubspot-integration/utils/HubspotIntegrationService';

export const eventName = FlexEvent.taskCompleted;
export const eventHook = async function sendDataToHubspot(flex: typeof Flex, manager: Flex.Manager, task: Flex.ITask) {
    const conversationSid = task?.attributes?.conversationSid;
    const contactId = task?.attributes?.objectId;
    const contactName = task?.attributes?.name ?? task?.attributes?.customerName;

    if (conversationSid) {
        await HubspotIntegrationService.saveConversation(conversationSid, contactId, contactName);
    }
};