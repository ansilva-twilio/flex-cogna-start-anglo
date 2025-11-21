import React, { useState, useEffect, useRef } from 'react';
import { Actions, ITask } from '@twilio/flex-ui';
import { Flex } from '@twilio-paste/core/flex';
import { Tabs, TabList, Tab, TabPanels, TabPanel, useTabState } from '@twilio-paste/core/tabs';
import { shouldDisplayTabs } from '../../config';

export interface Props {
  thisTask?: ITask; // task assigned to component
  task?: ITask; // task in Context
}

interface LoadCRMContainerTabsPayload {
  task?: ITask;
  components: CRMComponent[];
}

interface SelectCRMContainerTabPayload {
  title: string;
}

interface CRMComponent {
  title: string;
  component: React.ComponentType;
  order?: number;
}

export const TabbedCRMTask = ({ thisTask, task }: Props) => {
  const [customComponents, setCustomComponents] = useState<CRMComponent[] | null>(null);
  const thisTaskRef = useRef(thisTask);
  const isMountedRef = useRef(true);

  // eslint-disable-next-line no-console
  console.debug('[TabbedCRMTask] rendering', {
    thisTaskSid: thisTask?.taskSid,
    containerTaskSid: task?.taskSid,
    customComponentsCount: customComponents?.length ?? 0,
  });

  const tabState = useTabState({ baseId: 'enhanced-crm-tabs' });

  // Keep the ref up-to-date with the current thisTask
  useEffect(() => {
    thisTaskRef.current = thisTask;
  }, [thisTask]);

  // Track mount/unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // This allows short-lived tasks (e.g. callback tasks) to share/show
  // the same components as their parent task so CRM work can continue after
  // the short-lived task completes and disappears. This is done by rendering
  // components for every task, keeping the components alive, and toggling visibility.
  // Special-case the "no-task" instance (when `thisTask` is undefined) so
  // it displays when there is no container task (show default CRM when nothing selected).
  let display: 'flex' | 'none' = 'none';
  if (thisTask) {
    display = task?.taskSid === thisTask?.taskSid || (thisTask && task?.attributes?.parentTask === thisTask?.sid) ? 'flex' : 'none';
  } else {
    // no-task instance: show only when there is no container task
    display = task ? 'none' : 'flex';
  }

  const handleCustomComponent = (payload: LoadCRMContainerTabsPayload) => {
    // The action can be invoked multiple times at once. Ensure we handle the correct invocation.
    // Match payload to this instance. For the no-task instance both sides will be undefined.
    // Use the ref to always get the current thisTask value
    // eslint-disable-next-line no-console
    console.debug('[TabbedCRMTask:handleCustomComponent]', {
      payloadTaskSid: payload.task?.taskSid,
      thisTaskSid: thisTaskRef.current?.taskSid,
      match: payload.task?.taskSid === thisTaskRef.current?.taskSid,
      componentCount: payload.components?.length ?? 0,
      isMounted: isMountedRef.current,
    });
    if (payload.task?.taskSid !== thisTaskRef.current?.taskSid) {
      return;
    }
    if (payload.components && isMountedRef.current) {
      setCustomComponents(payload.components.sort((a, b) => (a.order ?? 999) - (b.order ?? 999)));
    }
  };

  const handleSelectTab = (payload: SelectCRMContainerTabPayload) => {
    if (!payload.title) {
      return;
    }

    tabState.select(`crm-tab-${payload.title}`);
  };

  useEffect(() => {
    Actions.addListener('afterLoadCRMContainerTabs', handleCustomComponent);
    Actions.addListener('afterSelectCRMContainerTab', handleSelectTab);

    return () => {
      // Clean up listeners when component unmounts
      Actions.removeListener('afterLoadCRMContainerTabs', handleCustomComponent);
      Actions.removeListener('afterSelectCRMContainerTab', handleSelectTab);
    };
  }, [handleCustomComponent, handleSelectTab]);

  // Re-invoke the LoadCRMContainerTabs action whenever this instance's task
  // or the container's selected task changes so tabs/components update live.
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.debug('[TabbedCRMTask] invoking LoadCRMContainerTabs', {
      thisTaskSid: thisTask?.taskSid,
      containerTaskSid: task?.taskSid,
    });
    Actions.invokeAction('LoadCRMContainerTabs', {
      task: thisTask,
      components: [],
    });
  }, [thisTask, task]);

  return (
    <div style={{ display, flex: '1 0 auto' }}>
      { shouldDisplayTabs() && 
        <Tabs state={tabState} element="CRM_TABS">
          <TabList aria-label="CRM tabs" element="CRM_TAB_LIST">
            {customComponents &&
              customComponents.map((component) => <Tab key={`crm-tab-${component.title}`}>{component.title}</Tab>)}
          </TabList>
          <TabPanels element="CRM_TAB_PANELS">
            {customComponents &&
              customComponents.map((component) => {
                const comp = component.component;
                if (React.isValidElement(comp)) {
                  return (
                    <TabPanel element="CRM_TAB_PANEL" key={`crm-tab-panel-${component.title}`}>
                      <Flex grow element="CRM_FLEX">
                        {comp}
                      </Flex>
                    </TabPanel>
                  );
                }
                const Comp = comp as React.ComponentType<any>;
                return (
                  <TabPanel element="CRM_TAB_PANEL" key={`crm-tab-panel-${component.title}`}>
                    <Flex grow element="CRM_FLEX">
                      <Comp task={thisTask} />
                    </Flex>
                  </TabPanel>
                );
              })}
          </TabPanels>
        </Tabs>
      }
      { !shouldDisplayTabs() && customComponents && 
        <Flex grow element="CRM_FLEX">
          {(() => {
            const comp = customComponents[0]?.component;
            if (!comp) return null;
            if (React.isValidElement(comp)) return comp;
            const First = comp as React.ComponentType<any>;
            return <First task={thisTask} />;
          })()}
        </Flex>
      }
    </div>
  );
};
