import * as Flex from '@twilio/flex-ui';

import { FlexEvent } from '../../../../types/feature-loader';
import { getInitialFirstPanelSize } from '../../../hubspot-integration/config';

export const eventName = FlexEvent.pluginsInitialized;
export const eventHook = function resizePanel2(flex: typeof Flex, manager: Flex.Manager, task: Flex.ITask) {
    flex.AgentDesktopView.defaultProps.splitterOptions = {
        initialFirstPanelSize: getInitialFirstPanelSize(), // left panel width
        minimumFirstPanelSize: "400px",
        minimumSecondPanelSize: "600px",
    };
};