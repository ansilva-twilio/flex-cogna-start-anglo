import React, { useState, useRef, useEffect } from 'react';
import { IconButton, ITask } from '@twilio/flex-ui';

import { IFrameRefreshButtonStyledDiv } from './IFrameCRMTab.Styles';
import { getUrl, displayUrlWhenNoTasks, displayUrlWhenNotFound } from '../../config';
import { replaceStringAttributes } from '../../../../utils/helpers';

export interface Props {
  task: ITask;
}

export const IFrameCRMTab = ({ task }: Props) => {
  const iFrameRef = useRef<HTMLIFrameElement>(null);
  const [iFrameKey, setIframeKey] = useState(0 as number);

  const handleOnClick = () => {
    setIframeKey(Math.floor(Math.random() * (Number.MAX_SAFE_INTEGER + 1)));
  };

  let baseUrl = displayUrlWhenNoTasks();
  if (task) {
    if (task.attributes?.objectId != 0) {
      baseUrl = getUrl();
    } else {
      baseUrl = displayUrlWhenNotFound();
    }
  }
  const url = replaceStringAttributes(baseUrl, task);
  // eslint-disable-next-line no-console
  console.debug('[IFrameCRMTab]', {
    taskSid: task?.taskSid,
    taskAttributesFrom: task?.attributes?.from,
    taskAttributesDirection: task?.attributes?.direction,
    baseUrl,
    finalUrl: url,
  });

  return (
    <div style={{ display: 'flex', flex: '1 1 auto', minHeight: 0 }}>
      <IFrameRefreshButtonStyledDiv onClick={handleOnClick}>
        <IconButton variant="primary" icon="Loading" />
      </IFrameRefreshButtonStyledDiv>
      <iframe
        key={iFrameKey}
        src={url}
        ref={iFrameRef}
        title="enhanced-crm-iframe"
        data-crm-url={url}
        style={{ flex: '1 1 auto', width: '100%', height: '100%', border: '0', minHeight: 200 }}
      />
    </div>
  );
};