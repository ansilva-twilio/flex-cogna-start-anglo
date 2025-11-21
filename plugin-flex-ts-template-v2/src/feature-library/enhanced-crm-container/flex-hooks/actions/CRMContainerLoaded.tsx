import * as Flex from '@twilio/flex-ui';

import IFrameCRMTab from '../../custom-components/IFrameCRMTab';
import { FlexActionEvent } from '../../../../types/feature-loader';
import { shouldDisplayUrlWhenNoTasks, getUrlTabTitle, isUrlTabEnabled } from '../../config';

export const actionEvent = FlexActionEvent.before;
export const actionName = 'LoadCRMContainerTabs';
export const actionHook = function addURLTabToEnhancedCRM(flex: typeof Flex) {
  if (!isUrlTabEnabled()) {
    return;
  }
  flex.Actions.addListener(`${actionEvent}${actionName}`, async (payload) => {
    // eslint-disable-next-line no-console
    console.debug('[CRMContainerLoaded] listener fired', {
      payloadTaskSid: payload.task?.taskSid,
      shouldDisplayUrl: !!payload.task || shouldDisplayUrlWhenNoTasks(),
    });
    if (!payload.task && !shouldDisplayUrlWhenNoTasks()) {
      return;
    }

    const component = { title: getUrlTabTitle(), component: <IFrameCRMTab task={payload.task} key="iframe-crm-container" /> };

    payload.components = [...payload.components, component];
    // eslint-disable-next-line no-console
    console.debug('[CRMContainerLoaded] component added', {
      payloadTaskSid: payload.task?.taskSid,
      componentCount: payload.components.length,
    });
  });
};
