import type { ComponentMeta, ComponentStory } from '@storybook/react';
import { VerticalProfileChart } from '~/fb/components/VerticalProfileChart/VerticalProfileChart';
import { latLngWaypointFactory } from '~/fb/domain';
import { emptyElevation } from '~/fb/elevationOnRoute';
import { Route } from '~domain/Route';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
    title: 'Example/VerticalProfileChart',
    component: VerticalProfileChart,
    // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
    argTypes: {
        backgroundColor: { control: 'color' },
    },
} as ComponentMeta<typeof VerticalProfileChart>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof VerticalProfileChart> = (args) => (
    <VerticalProfileChart {...args} />
);

export const Primary = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
    route: Route.factory({
        waypoints: [
            latLngWaypointFactory({ latLng: { lat: 42, lng: 2.5 }, name: 'WPT 1', altitude: 12 }),
            latLngWaypointFactory({ latLng: { lat: 42, lng: 3 }, name: 'WPT 2', altitude: 3000 }),
            latLngWaypointFactory({ latLng: { lat: 42, lng: 3.5 }, name: 'WPT 3', altitude: 123 }),
        ],
    }),
    elevation: emptyElevation,
    airspaceOverlaps: [],
};
