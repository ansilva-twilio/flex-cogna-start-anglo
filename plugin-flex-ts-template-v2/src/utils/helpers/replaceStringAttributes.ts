import { ITask, Manager } from '@twilio/flex-ui';

import ApiService from '../serverless/ApiService';

class ReplaceStringService extends ApiService {
  serverlessUrl = `${this.serverlessProtocol}://${this.serverlessDomain}`;
}

const replaceStringServiceInstance = new ReplaceStringService();

/**
 * This function accepts a string and performs templatized replacement of task attributes, worker attributes, and serverless domains
 * @param {string} text - Templatized input string
 * @param {ITask} task - Task from which to source attributes
 * @returns {string}  - The transformed string
 */
export default (text: string, task?: ITask): string => {
  return text.replace(/{{(task|worker|serverless)\.((\w|\.)+)}}/g, (match: string, part1: string, part2: string) => {
    // this runs for each match found

    let attributes;

    if (part1 === 'task' && task) {
      attributes = task.attributes;
    } else if (part1 === 'worker') {
      attributes = Manager.getInstance().workerClient?.attributes;
    } else if (part1 === 'serverless') {
      return replaceStringServiceInstance.serverlessUrl;
    } else {
      // No task provided but template requires task attributes
      // eslint-disable-next-line no-console
      console.warn('[replaceStringAttributes] No task provided for template requiring task attributes', {
        match,
        part1,
        part2,
      });
      return `[MISSING:${part1}.${part2}]`;
    }

    const result = part2.split('.').reduce((accumulator: any, current, _index, array) => {
      if (!accumulator || !accumulator[current]) {
        // Attribute is missing
        // eslint-disable-next-line no-console
        console.warn('[replaceStringAttributes] Missing attribute', {
          fullPath: `${part1}.${part2}`,
          missingAt: current,
          taskSid: task?.taskSid,
        });
        // abort early by removing the rest of the array
        array.splice(1);
        return null;
      }
      return accumulator[current];
    }, attributes);

    // Return placeholder if attribute was not found
    return result !== null ? result : `[MISSING:${part1}.${part2}]`;
  });
};
