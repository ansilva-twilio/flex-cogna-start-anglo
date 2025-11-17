import * as Flex from '@twilio/flex-ui';

import { FlexComponent } from '../../../../types/feature-loader';
import StoriesView from '../../custom-components/StoriesView';

export const componentName = FlexComponent.ViewCollection;
export const componentHook = function addStoriesView(flex: typeof Flex) {
  flex.ViewCollection.Content.add(
    <flex.View name="stories" key="stories-view">
      <StoriesView key="stories-view-content" />
    </flex.View>,
  );
};
