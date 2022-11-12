import type { ComponentMeta } from '@storybook/react';
import { foldW } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import { draw } from 'io-ts/lib/Decoder';
import { useEffect, useState } from 'react';
import { AiracData, AirspaceType, DangerZoneType } from 'ts-aerodata-france';
import currentCycle from 'ts-aerodata-france/build/jsonData/2022-10-06.json';
import { Route } from '~/domain/Route';
import type { VerticalProfileChartProps } from '~/fb/components/VerticalProfileChart/VerticalProfileChart';
import { VerticalProfileChart } from '~/fb/components/VerticalProfileChart/VerticalProfileChart';
import type { ElevationAtPoint } from '~/fb/elevationOnRoute';
import { elevationOnRoute } from '~/fb/elevationOnRoute';
import { openElevationApiElevationService } from '~/services/elevation';
import '../app/styles/global.css';
import longRouteJSON from './route.json';
import shortRouteJSON from './shortRoute.json';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
    title: 'Example/VerticalProfileChart',
    component: VerticalProfileChart,
    // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
    argTypes: {},
} as ComponentMeta<typeof VerticalProfileChart>;

type LoadedData = { loaded: { airacData: AiracData } };

export const ShortRoute = (
    args: VerticalProfileChartProps,
    { loaded: { airacData } }: LoadedData,
) => {
    if (!airacData) {
        return null;
    }

    return (
        <RouteC
            {...{
                ...args,
                airacData,
                route: decodeRoute(airacData)(shortRouteJSON),
                airspaceOverlaps: [],
            }}
        />
    );
};

export const LongRoute = (
    args: VerticalProfileChartProps,
    { loaded: { airacData } }: LoadedData,
) => {
    if (!airacData) {
        return null;
    }

    console.log('rendering');
    const route = decodeRoute(airacData)(longRouteJSON);
    console.log('route', route);
    return (
        <RouteC
            {...{
                ...args,
                airacData,
                route,
                airspaceOverlaps: [
                    {
                        airspace: airacData.dangerZones.filter(
                            (a) =>
                                a.type === DangerZoneType.D &&
                                a.lowerLimit.toString().includes('ASFC'),
                        )[1]!,
                        segments: [[100, 110]],
                    },
                    {
                        airspace: airacData.dangerZones.filter(
                            (a) =>
                                a.type === DangerZoneType.D &&
                                a.lowerLimit.toString().includes('ASFC'),
                        )[0]!,
                        segments: [[50, 90]],
                    },
                    {
                        airspace: airacData.airspaces.filter(
                            (a) => a.lowerLimit.feetValue > 5000,
                        )[0]!, // Should not get displayed
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
                ],
            }}
        />
    );
};

const RouteC = (args: VerticalProfileChartProps & { airacData: AiracData }) => {
    const [elevation, setElevation] = useState<ElevationAtPoint>();
    console.log('rendering component with airacData', args.airacData);
    console.log('elevation', args.elevation);

    useEffect(() => {
        elevationOnRoute({
            elevationService: {
                getElevationsForLatLngs: (latLngs) =>
                    openElevationApiElevationService(latLngs.map(({ lat, lng }) => [lat, lng])),
            },
        })(args.route).then((e) => setElevation(e));
    }, []);

    return elevation ? <VerticalProfileChart {...args} elevation={elevation} /> : <></>;
};

const loaders = [
    async () => ({
        airacData: await AiracData.loadCycle(currentCycle),
    }),
];

ShortRoute.loaders = loaders;
LongRoute.loaders = loaders;

const decodeRoute = (airacData: AiracData) => (routeJSON: unknown) => {
    return pipe(
        Route.codec(airacData).decode(routeJSON),
        foldW(
            (e) => {
                console.log(draw(e));
                return Route.empty();
            },
            (r) => r,
        ),
    );
};
