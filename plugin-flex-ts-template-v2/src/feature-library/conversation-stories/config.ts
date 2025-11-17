import { getFeatureFlags } from '../../utils/configuration';
import ConversationStoriesConfig from './types/ServiceConfiguration';

const { enabled = false } = (getFeatureFlags()?.features?.conversation_stories as ConversationStoriesConfig) || {};

export const isFeatureEnabled = () => {
  return enabled;
};
