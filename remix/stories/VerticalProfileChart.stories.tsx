import type { ComponentMeta, ComponentStory } from '@storybook/react';
import { foldW } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import { draw } from 'io-ts/lib/Decoder';
import { useEffect, useState } from 'react';
import { AiracCycles, AiracData, DangerZoneType } from 'ts-aerodata-france';
import { Route } from '~/domain/Route';
import { VerticalProfileChart } from '~/fb/components/VerticalProfileChart/VerticalProfileChart';
import { ElevationAtPoint, elevationOnRoute, emptyElevation } from '~/fb/elevationOnRoute';
import { openElevationApiElevationService } from '~/fb/ElevationService/openElevationApiElevationService';
import routeJSON from './route.json';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
    title: 'Example/VerticalProfileChart',
    component: VerticalProfileChart,
    // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
    argTypes: {
    },
} as ComponentMeta<typeof VerticalProfileChart>;

const airacData = AiracData.loadCycle(AiracCycles.SEP_08_2022);
// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof VerticalProfileChart> = (args) => {
    
    
    const [elevation, setElevation] = useState<ElevationAtPoint>();
    


    useEffect(() => {
        elevationOnRoute({
            elevationService: openElevationApiElevationService,
        })(args.route).then((e) => setElevation(e));
    },[])

    
    const newArgs = {...args, elevation: elevation || emptyElevation};
    
 return   ( <VerticalProfileChart {...newArgs} />)
}


// export const Primary = Template.bind({});
export const WithElevation = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
// Primary.args = {
//     route: Route.factory({
//         waypoints: [
//             latLngWaypointFactory({ latLng: { lat: 42, lng: 2.5 }, name: 'WPT 1', altitude: 12 }),
//             latLngWaypointFactory({ latLng: { lat: 42, lng: 3 }, name: 'WPT 2', altitude: 3000 }),
//             latLngWaypointFactory({ latLng: { lat: 42, lng: 3.5 }, name: 'WPT 3', altitude: 123 }),
//         ],
//     }),
//     elevation: emptyElevation,
//     airspaceOverlaps: [],
// };

WithElevation.args = {
    route: pipe(Route.codec(airacData).decode(routeJSON), foldW((e) => {
        console.log(draw(e));
        return Route.empty();
    }, (r) => r)),
    airspaceOverlaps: [{airspace: (airacData.dangerZones.filter((a) => a.type === DangerZoneType.D && a.lowerLimit.toString().includes("ASFC")))[1]!, segments: [[100, 110]]}],
};
