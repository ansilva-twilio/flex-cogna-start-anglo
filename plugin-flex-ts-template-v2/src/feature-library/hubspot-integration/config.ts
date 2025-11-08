import { getFeatureFlags } from '../../utils/configuration';
import HubspotIntegrationConfig from './types/ServiceConfiguration';

const { enabled = true, initialFirstPanelSize = '512px' } = (getFeatureFlags()?.features?.hubspot_integration as HubspotIntegrationConfig) || {};

export const isFeatureEnabled = () => {
  return enabled;
};

export const getInitialFirstPanelSize = () => {
  return initialFirstPanelSize;
}