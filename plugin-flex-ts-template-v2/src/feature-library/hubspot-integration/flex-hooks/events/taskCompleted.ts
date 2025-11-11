import * as Flex from '@twilio/flex-ui';

import { FlexEvent } from '../../../../types/feature-loader';
import HubspotIntegrationService from '../../../hubspot-integration/utils/HubspotIntegrationService';

export const eventName = FlexEvent.taskCompleted;
export const eventHook = async function sendDataToHubspot(flex: typeof Flex, manager: Flex.Manager, task: Flex.ITask) {
    const conversationSid = task?.attributes?.conversationSid;
    console.log("[Flex Plugin] [Hubspot Integration] Task Completed Action - Checking Conversation", conversationSid);

    const contactId = task?.attributes?.objectId;
    const contactName = (task?.attributes?.name ?? task?.attributes?.customerName) ?? "Não identificado";

    if (conversationSid && contactId && contactId != "0") {
        console.log("[Flex Plugin] [Hubspot Integration] Saving conversation to Hubspot", conversationSid, contactId, contactName);
        await HubspotIntegrationService.saveConversation(conversationSid, contactId, contactName);
    } else {
        console.log("[Flex Plugin] [Hubspot Integration] Conversation will not be saved to Hubspot", conversationSid, contactId, contactName);
    }
};