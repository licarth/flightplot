import type { ComponentMeta, ComponentStory } from '@storybook/react';
import { foldW } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import { draw } from 'io-ts/lib/Decoder';
import { AiracData, AirspaceType, DangerZoneType } from 'ts-aerodata-france';
import currentCycle from 'ts-aerodata-france/build/jsonData/2023-03-23.json';
import { OldRoute } from '~/domain/Route';
import { VerticalProfileChart } from '~/fb/components/VerticalProfileChart/VerticalProfileChart';
import { emptyElevation } from '~/fb/elevationOnRoute';
import '../app/styles/global.css';
import routeJSON from './route.json';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
    title: 'Example/VerticalProfileChart',
    component: VerticalProfileChart,
    // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
    argTypes: {},
} as ComponentMeta<typeof VerticalProfileChart>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
//@ts-ignore
const Template: ComponentStory<typeof VerticalProfileChart> = (
    args,
    {
        loaded: { airacData },
    }: { loaded: { airacData: Awaited<ReturnType<typeof AiracData.loadCycle>> } },
) => {
    // useEffect(() => {
    const route = pipe(
        OldRoute.codec(airacData).decode(routeJSON),
        foldW(
            (e) => {
                console.log(draw(e));
                return OldRoute.empty();
            },
            (r) => r,
        ),
    );
    // elevationOnRoute({
    //     elevationService: localApiElevationService,
    // })(route).then((e) => setElevation(e));
    // }, []);

    const newArgs = { ...args, elevation: emptyElevation };

    return (
        <VerticalProfileChart
            // {...newArgs}
            route={route}
            elevation={emptyElevation}
            airspaceOverlaps={[
                {
                    airspace: airacData.dangerZones.filter(
                        (a) =>
                            a.type === DangerZoneType.D && a.lowerLimit.toString().includes('ASFC'),
                    )[1]!,
                    segments: [[100, 110]],
                },
                {
                    airspace: airacData.dangerZones.filter(
                        (a) =>
                            a.type === DangerZoneType.D && a.lowerLimit.toString().includes('ASFC'),
                    )[0]!,
                    segments: [[50, 90]],
                },
                {
                    airspace: airacData.airspaces.filter((a) => a.lowerLimit.feetValue > 5000)[0]!, // Should not get displayed
                    segments: [[50, 90]],
                },
                {
                    airspace: airacData.airspaces.filter(
                        (a) => a.type === AirspaceType.CTR && a.lowerLimit.toString() === 'SFC',
                    )[8]!,
                    segments: [[-100, 30]],
                },
                {
                    airspace: airacData.dangerZones.filter(
                        (a) =>
                            a.type === DangerZoneType.P &&
                            a.higherLimit.toString().includes('ASFC') &&
                            a.higherLimit.feetValue <= 4000,
                    )[3]!,
                    segments: [[130, 150]],
                },
                {
                    airspace: airacData.dangerZones.filter(
                        (a) =>
                            a.type === DangerZoneType.P &&
                            a.higherLimit.toString().includes('ASFC') &&
                            a.higherLimit.feetValue <= 4000,
                    )[2]!,
                    segments: [[130, 150]],
                },
                {
                    airspace: airacData.dangerZones.filter(
                        (a) =>
                            a.type === DangerZoneType.P &&
                            a.higherLimit.toString().includes('ASFC') &&
                            a.higherLimit.feetValue <= 4000,
                    )[4]!,
                    segments: [[130, 150]],
                },
            ]}
        />
    );
};

// export const Primary = Template.bind({});
export const WithoutElevation = Template.bind({});
WithoutElevation.loaders = [
    async () => ({
        airacData: await AiracData.loadCycle(currentCycle),
    }),
];

// export const ShortRoute = Template.bind({});
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

// ShortRoute.args = {
//     route: pipe(
//         Route.codec(airacData).decode(shortRouteJSON),
//         foldW(
//             (e) => {
//                 console.log(draw(e));
//                 return Route.empty();
//             },
//             (r) => r,
//         ),
//     ),
//     airspaceOverlaps: [],
// };
