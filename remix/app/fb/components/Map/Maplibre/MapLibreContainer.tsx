import maplibregl from 'maplibre-gl';
import { useEffect, useRef, useState } from 'react';
import type { MapRef } from 'react-map-gl';
import Map from 'react-map-gl';
import styled from 'styled-components';
import type { Aerodrome } from 'ts-aerodata-france';
import { IcaoCode } from 'ts-aerodata-france';
import { toCheapRulerPoint, toLeafletLatLng } from '~/domain';
import { StyledAerodromeLogo } from '../../StyledAerodromeLogo';
import { useAiracData } from '../../useAiracData';
import { boxAround } from '../boxAround';
import CustomOverlay from './CustomOverlay';

export const MapLibreContainer = () => {
    const { airacData } = useAiracData();

    // const { map } = useMap();
    const mapRef = useRef<MapRef | null>(null);

    const [map, setMap] = useState<MapRef>();

    useEffect(() => {
        setMap(() => (mapRef.current ? mapRef.current : undefined));
    }, [mapRef.current]);

    return (
        <Map
            mapLib={maplibregl}
            ref={mapRef}
            initialViewState={{
                longitude: 2.55,
                latitude: 43.01,
                zoom: 7,
            }}
            mapStyle="https://demotiles.maplibre.org/style.json"
        >
            {map && <Overlay map={map} />}
        </Map>
    );
};

const Overlay = ({ map }: { map: MapRef }) => {
    const { airacData } = useAiracData();

    const ads = airacData && airacData.aerodromes.filter(({ status }) => status === 'PRV');

    return <Aerodromes aerodromes={ads || []} map={map} />;
};

const Aerodromes = ({ aerodromes, map }: { aerodromes: Aerodrome[]; map: MapRef }) => {
    return (
        <CustomOverlay>
            <>
                {aerodromes.map((ad) => (
                    <AerodromeSvg key={'ad-' + IcaoCode.getValue(ad.icaoCode)} ad={ad} map={map} />
                ))}
            </>
        </CustomOverlay>
    );
};

const AerodromeSvg = ({ ad, map }: { ad: Aerodrome; map: MapRef }) => {
    const coords = [Number(ad.latLng.lng), Number(ad.latLng.lat)];
    console.log('coords', coords);
    // const origin = map.project(map.unproject([0, 0]));
    const adPosition = ad.latLng && map.project(coords);

    console.log('origin', origin);

    const width = map.getContainer().clientWidth;
    const height = map.getContainer().clientHeight;

    const bounds = boxAround(toCheapRulerPoint(toLeafletLatLng(ad.latLng)), 10_000);

    console.log('bounds', bounds as [[number, number], [number, number]]);

    const bottomLeft = map.project(bounds[0]);
    const topRight = map.project(bounds[1]);

    console.log('bottomLeft', bottomLeft);
    console.log('topRight', topRight);

    const [dx, dy] = [topRight.x - bottomLeft.x, topRight.y - bottomLeft.y];

    console.log('dx', dx);
    console.log('dy', dy);

    return (
        // This is the frame
        <>
            {/* <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
                <rect
                    x={adPosition.x}
                    y={adPosition.y}
                    width="100"
                    height="100"
                    stroke="black"
                    fill="black"
                />
            </svg> */}
            <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
                <rect
                    x={adPosition.x}
                    y={adPosition.y}
                    width={dx}
                    height={-dy}
                    stroke="black"
                    fill="black"
                />
            </svg>
            {/* <AbsDiv>OKOK</AbsDiv> */}
            <TranslatedDiv x={adPosition.x} y={adPosition.y} dx={dx} dy={-dy}>
                <StyledAerodromeLogo aerodrome={ad} />
            </TranslatedDiv>
        </>
    );
};

const AbsDiv = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    width: 0px;
    height: 0px;
`;

const TranslatedDiv = styled.div<{ x: number; y: number; dx: number; dy: number }>`
    position: absolute;
    border: 1px solid red;
    top: 0;
    left: 0;
    transform: translate(${({ x }) => x}px, ${({ y }) => y}px);
    transform-origin: 50% 50%;
    overflow: visible;
    width: ${({ dx }) => dx}px;
    height: 0px;
`;
// <CustomOverlay>
//                 {origin && airacData ? (
//                     // <StyledAerodromeLogo
//                     //     aerodrome={
//                     //         LFMT
//                     //     }
//                     // />
//                     <svg viewBox={`${origin.x} ${origin.y} ${100} ${100}`}>
//                         <rect x={origin.x} y={origin.y} width="100" height="100" fill="black" />
//                     </svg>
//                 ) : (
//                     <></>
//                 )}
//             </CustomOverlay>
