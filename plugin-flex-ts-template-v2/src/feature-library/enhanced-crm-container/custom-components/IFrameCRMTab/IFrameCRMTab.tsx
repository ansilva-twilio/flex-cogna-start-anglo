import React, { useState, useRef } from 'react';
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

  // Validate required Hubspot attributes
  const hasRequiredAttributes = task &&
    task.attributes?.instanceId &&
    task.attributes?.objectTypeId &&
    task.attributes?.objectId;

  let baseUrl = displayUrlWhenNoTasks();
  if (task) {
    // Check if objectId exists and is not 0
    if (task.attributes?.objectId && task.attributes.objectId !== 0) {
      baseUrl = getUrl();
    } else {
      baseUrl = displayUrlWhenNotFound();
    }
  }

  const url = replaceStringAttributes(baseUrl, task);

  // Check if URL is malformed (contains empty segments or MISSING placeholders)
  const isMalformedUrl = url.includes('//record//') ||
    url.includes('/contacts//') ||
    url.includes('[MISSING:');

  // Enhanced logging for debugging
  // eslint-disable-next-line no-console
  console.debug('[IFrameCRMTab] Rendering iframe', {
    taskSid: task?.taskSid,
    taskAttributesFrom: task?.attributes?.from,
    taskAttributesDirection: task?.attributes?.direction,
    hubspotAttributes: {
      instanceId: task?.attributes?.instanceId || 'MISSING',
      objectTypeId: task?.attributes?.objectTypeId || 'MISSING',
      objectId: task?.attributes?.objectId || 'MISSING',
    },
    hasRequiredAttributes,
    baseUrl,
    finalUrl: url,
    isMalformedUrl,
  });

  // Warn if required attributes are missing
  if (task && !hasRequiredAttributes) {
    // eslint-disable-next-line no-console
    console.warn('[IFrameCRMTab] Missing required Hubspot attributes for task', {
      taskSid: task.taskSid,
      missingAttributes: {
        instanceId: !task.attributes?.instanceId,
        objectTypeId: !task.attributes?.objectTypeId,
        objectId: !task.attributes?.objectId,
      },
      taskAttributes: task.attributes,
    });
  }

  // Warn if URL appears malformed
  if (isMalformedUrl) {
    // eslint-disable-next-line no-console
    console.warn('[IFrameCRMTab] URL appears malformed, check task attributes', {
      taskSid: task?.taskSid,
      url,
      baseUrl,
    });
  }
  return (
    <>
      <IFrameRefreshButtonStyledDiv onClick={handleOnClick}>
        <IconButton variant="primary" icon="Loading" />
      </IFrameRefreshButtonStyledDiv>
      <iframe key={iFrameKey} src={url} ref={iFrameRef} />
    </>
  );
};
