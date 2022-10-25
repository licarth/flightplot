import type { LatLng } from 'leaflet';
import { useEffect, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useMapEvent } from 'react-leaflet';
import { toDomainLatLng } from '~/domain';
import { useMouseMode } from '../MouseModeContext';
import { useRoute } from '../useRoute';
import { addFixtureToRoute } from './addFixtureToRoute';
import { useFixtureFocus } from './FixtureFocusContext';

export const MouseEvents = () => {
    const routeContext = useRoute();
    const { addLatLngWaypoint } = routeContext;
    const [mouseLocation, setMouseLocation] = useState<LatLng | null>(null);

    const { setClickedLocation, setHighlightedLocation, highlightedFixture, clear } =
        useFixtureFocus();

    const { mouseMode } = useMouseMode();

    useMapEvent('click', (e) => {
        if (mouseMode === 'command') {
            e.originalEvent.preventDefault();
            highlightedFixture && addFixtureToRoute({ fixture: highlightedFixture, routeContext });
        } else if (mouseMode === 'command+shift') {
            e.originalEvent.preventDefault();
            addLatLngWaypoint({ latLng: e.latlng });
        } else {
            setClickedLocation(toDomainLatLng(e.latlng));
        }
    });

    useMapEvent('mousemove', (e) => {
        setMouseLocation(e.latlng);
    });

    useEffect(() => {
        if (mouseMode === 'none' || mouseMode === 'command+shift') {
            setHighlightedLocation(undefined);
        } else if (mouseMode === 'command') {
            mouseLocation && setHighlightedLocation(toDomainLatLng(mouseLocation));
        }
    }, [mouseMode, setHighlightedLocation, mouseLocation]);

    useHotkeys(
        'esc',
        () => {
            clear();
        },
        { keydown: true },
    );

    return <></>;
};
