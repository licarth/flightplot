import * as turf from '@turf/turf';
import type { Marker as LeafletMarker } from 'leaflet';
import { Point } from 'leaflet';
import _ from 'lodash';
import React, { useRef, useState } from 'react';
import { Marker, Polygon } from 'react-leaflet';
import type { Route } from '../../../../domain';
import type { LatLng } from '../../../../domain/LatLng';
import type { PageFormat } from '../../../../domain/PageFormat';
import { toArrayCoords } from '../../../../domain/VerticalProfileGraphical';
import { FORMATS } from '../../PrintContext';
import { useRoute } from '../../useRoute';
import { convertToCoords, convertToLambert } from '../coordsConverter';
import { icon } from './Icons';

const allIconsOffset = 20;
const bottomLeftIcon = icon('arrows-rotate', new Point(allIconsOffset + 45, 15));
const deleteIcon = icon('trash', new Point(allIconsOffset + 75, 15));
const moveIcon = icon('arrows-up-down-left-right', new Point(allIconsOffset + 15, 15));

const hundredMilliInLambert = 105_000 / 2.1;
const pageFormats = [FORMATS.A4_PORTRAIT, FORMATS.A4_LANDSCAPE];

export const PrintAreaPreview = () => {
    const { route, setRoute } = useRoute();

    return (
        <>
            {route &&
                route.printAreas &&
                route.printAreas.map((printArea, i) => (
                    <SinglePrintAreaPreview
                        key={`print-area-${i}`}
                        route={route}
                        setRoute={setRoute}
                        currentPrintAreaIndex={i}
                    />
                ))}
        </>
    );
};

const SinglePrintAreaPreview = ({
    currentPrintAreaIndex,
    route,
    setRoute,
}: {
    currentPrintAreaIndex: number;
    route: Route;
    setRoute: React.Dispatch<React.SetStateAction<Route | undefined>>;
}) => {
    const [bottomLeftDrag, setBottomLeftDrag] = useState<LatLng | null>(null);
    const markerRef = useRef<LeafletMarker>(null);
    if (currentPrintAreaIndex === undefined || !route.printAreas) {
        return <></>;
    }
    const currentPrintArea = route.printAreas[currentPrintAreaIndex];
    if (!currentPrintArea) return <></>;
    const pageFormat = currentPrintArea.pageFormat;
    const pageWidthInLambert = (hundredMilliInLambert * pageFormat.dxMillimeters) / 100;
    const pageHeightInLambert =
        (pageWidthInLambert * pageFormat.dyMillimeters) / pageFormat.dxMillimeters;

    const setBottomLeft = (bottomLeft: LatLng) => {
        if (currentPrintAreaIndex !== undefined) {
            route.printAreas![currentPrintAreaIndex] = {
                ...route.printAreas![currentPrintAreaIndex],
                bottomLeft,
            };
            setRoute(route.clone({}));
        }
        setBottomLeftDrag(null);
    };

    const setPageFormat = (pageFormat: PageFormat) => {
        if (currentPrintAreaIndex !== undefined) {
            console.log('changing format');
            route.printAreas![currentPrintAreaIndex] = {
                ...route.printAreas![currentPrintAreaIndex],
                pageFormat,
            };
            setRoute(route.clone({}));
        }
    };

    const deleteArea = () => {
        if (currentPrintAreaIndex !== undefined) {
            console.log('changing format');
            route.printAreas!.splice(currentPrintAreaIndex, 1);
            setRoute(route.clone({}));
        }
    };

    const bottomLeftToShow = bottomLeftDrag || currentPrintArea?.bottomLeft;

    if (!bottomLeftToShow) return <></>;

    const lambertBottomLeft = convertToLambert(bottomLeftToShow);

    const lambert = {
        bottomLeft: lambertBottomLeft,
        bottomRight: {
            x: lambertBottomLeft.x + pageWidthInLambert,
            y: lambertBottomLeft.y,
        },
        topRight: {
            x: lambertBottomLeft.x + pageWidthInLambert,
            y: lambertBottomLeft.y + pageHeightInLambert,
        },
        topLeft: {
            x: lambertBottomLeft.x,
            y: lambertBottomLeft.y + pageHeightInLambert,
        },
    };

    const arrayCoords = _.mapValues(lambert, (v) => toArrayCoords(convertToCoords(v)));

    const shapes = [
        turf.greatCircle(arrayCoords.bottomLeft, arrayCoords.bottomRight),
        turf.greatCircle(arrayCoords.bottomRight, arrayCoords.topRight),
        turf.greatCircle(arrayCoords.topRight, arrayCoords.topLeft),
        turf.greatCircle(arrayCoords.topLeft, arrayCoords.bottomLeft),
    ];

    const positions = _.flatten(
        shapes.map((lineString) =>
            //@ts-ignore
            lineString.geometry.coordinates.map(([lat, lng]) => [lng, lat]),
        ) as unknown as [[[number, number]]],
    );

    return (
        <>
            {currentPrintArea.bottomLeft && (
                <>
                    <Marker
                        ref={markerRef}
                        position={currentPrintArea.bottomLeft}
                        icon={moveIcon}
                        draggable
                        interactive
                        eventHandlers={{
                            click: (e) => {
                                e.originalEvent.stopPropagation();
                            },
                            dblclick: (e) => {
                                e.originalEvent.stopPropagation();
                            },
                            drag: (e) =>
                                markerRef.current &&
                                setBottomLeftDrag(markerRef.current?.getLatLng()),
                            dragend: (e) =>
                                markerRef.current && setBottomLeft(markerRef.current?.getLatLng()),
                        }}
                    />{' '}
                    {!bottomLeftDrag && (
                        <>
                            <Marker
                                position={currentPrintArea.bottomLeft}
                                icon={deleteIcon}
                                interactive
                                eventHandlers={{
                                    click: () => {
                                        deleteArea();
                                    },
                                    dblclick: (e) => {
                                        e.originalEvent.stopPropagation();
                                    },
                                }}
                            />{' '}
                            <Marker
                                autoPan={true}
                                position={currentPrintArea.bottomLeft}
                                icon={bottomLeftIcon}
                                interactive={true}
                                eventHandlers={{
                                    dblclick: (e) => {
                                        e.originalEvent.stopPropagation();
                                    },
                                    click: (e) => {
                                        e.originalEvent.stopPropagation();
                                        setPageFormat(
                                            pageFormats[
                                                (pageFormats.findIndex(
                                                    (v) =>
                                                        v.dxMillimeters ===
                                                        pageFormat.dxMillimeters,
                                                ) +
                                                    1) %
                                                    pageFormats.length
                                            ],
                                        );
                                    },
                                }}
                            />
                        </>
                    )}
                </>
            )}
            <Polygon
                pathOptions={{ color: 'black', weight: 3, dashArray: '5' }}
                positions={positions}
                fill={false}
                color={'red'}
            />
        </>
    );
};
