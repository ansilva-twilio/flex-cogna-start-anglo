import * as Flex from '@twilio/flex-ui';

import { FlexComponent } from '../../../../types/feature-loader/FlexComponent';
import ConversationHistoryTab from '../../custom-components/ConversationHistoryTab';

export const componentName = FlexComponent.TaskCanvasTabs;
export const componentHook = function addConversationHistoryTab(flex: typeof Flex) {
  flex.TaskCanvasTabs.Content.add(<ConversationHistoryTab key="conversation-history-tab"
    label="Histórico" manager={flex.Manager} />);
};
