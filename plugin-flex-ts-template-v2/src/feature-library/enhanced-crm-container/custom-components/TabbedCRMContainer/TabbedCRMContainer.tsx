import React from 'react';
import { useFlexSelector, ITask } from '@twilio/flex-ui';

import AppState from '../../../../types/manager/AppState';
import { TabbedCRMTask } from '../TabbedCRMTask/TabbedCRMTask';

// Accept the `task` prop that the Flex CRM container provides and forward it
// to each TabbedCRMTask so they can determine visibility and load the correct tabs.
export const TabbedCRMContainer = (props: { task?: ITask }) => {
  const tasks = useFlexSelector((state: AppState) => state.flex.worker.tasks);
  const selectedTaskSid = useFlexSelector((state: AppState) => state.flex.view.selectedTaskSid);

  // containerTask can come from props (TaskCanvas) or from the selectedTaskSid in AgentDesktopView
  const containerTask = props.task ?? (selectedTaskSid ? tasks.get(selectedTaskSid) : undefined);

  // eslint-disable-next-line no-console
  console.debug('[TabbedCRMContainer] rendered', {
    propsTask: props.task?.taskSid,
    selectedTaskSid,
    containerTaskSid: containerTask?.taskSid,
    tasksCount: tasks.size,
  });

  // Only render new containers for tasks without a parent task
  const tasksFiltered = Array.from(tasks.values()).filter((task) => !task.attributes.parentTask);

  // Render for only the filtered tasks as well as an instance for when there is no task selected
  return (
    <>
      {tasksFiltered.map((task) => (
        <TabbedCRMTask thisTask={task} task={containerTask} key={task.taskSid} />
      ))}
      <TabbedCRMTask thisTask={undefined} task={containerTask} key="no-task" />
    </>
  );
};
