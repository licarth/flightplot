import type Leaflet from 'leaflet';
import type { LatLngExpression } from 'leaflet';
import { useRef } from 'react';
import { Circle, Marker, Tooltip, useMap } from 'react-leaflet';
import { preventDefault } from '../preventDefault';
import { circle, planeArrival, planeDeparture } from './Icons';

export type WaypointType = 'departure' | 'arrival' | 'intermediate';

export const FixtureWaypointMarker = ({
    position,
    label,
    circleColor,
    onDelete,
    onClick,
    preview = false,
    type = 'intermediate',
    waypointNumber,
}: {
    position: LatLngExpression;
    label?: string;
    type: WaypointType;
    circleColor?: string;
    onDelete?: () => void;
    onClick?: () => void;
    preview?: boolean;
    waypointNumber: number;
}) => {
    const markerRef = useRef<Leaflet.Marker>(null);
    const tooltipRef = useRef<Leaflet.Tooltip>(null);
    const map = useMap();
    const mapPane = map.getPane('mapPane');
    // console.log(mapPane);
    if (mapPane) {
        // console.log("Seetting pointerEvents");
        mapPane.style.pointerEvents = 'none';
    }
    const tooltipElement = tooltipRef.current?.getElement();
    if (tooltipElement) {
        // console.log("Seetting tooltip props");
        tooltipElement.style.pointerEvents = 'auto';
    }

    return (
        <Marker
            draggable={false}
            position={position}
            ref={markerRef}
            title={label}
            icon={getIcon(type)}
        >
            <Circle
                key={`circle-${waypointNumber}`}
                fill={false}
                center={position}
                radius={1000 * 2.5 * 1.852}
                pathOptions={{
                    color: circleColor || type === 'intermediate' ? 'black' : 'red',
                    dashArray: '4 1',
                }}
                fillOpacity={0}
            />
            <Tooltip
                ref={tooltipRef}
                key={`tooltip-${waypointNumber}`}
                eventHandlers={{
                    click: preventDefault,
                }}
            >
                {label}
            </Tooltip>
        </Marker>
    );
};

const getIcon = (waypointType: WaypointType) => {
    switch (waypointType) {
        case 'arrival':
            return planeArrival;
        case 'departure':
            return planeDeparture;
        case 'intermediate':
            return circle;
    }
};
