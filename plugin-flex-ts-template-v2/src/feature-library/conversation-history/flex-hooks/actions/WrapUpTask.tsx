import * as Flex from '@twilio/flex-ui';
import { FlexActionEvent, FlexAction } from '../../../../types/feature-loader';

import ConversationHistoryService from '../../utils/ConversationHistoryService';

export const actionEvent = FlexActionEvent.replace;
export const actionName = FlexAction.WrapupTask;
export const actionHook = async function addParticipantToConversationToBeLaterFound(
  flex: typeof Flex,
  manager: Flex.Manager,
) {
  flex.Actions.replaceAction(`${actionName}`, async (payload, original) => {
    // Only alter chat tasks, skip others
    if( payload.task.taskChannelUniqueName !== "chat" || payload.task.attributes.from.startsWith('whatsapp:')) {
        original(payload);
      }
      else {
        await ConversationHistoryService.addParticipantToConversation(payload.task.attributes.from, payload.task.attributes.conversationSid);
        return new Promise(function(resolve, reject) {
          resolve(original(payload));
        })        
      }
  });
};
