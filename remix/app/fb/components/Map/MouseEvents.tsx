import { useEffect } from 'react';
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

    const {
        setClickedLocation,
        setHighlightedLocation,
        highlightedFixture,
        clear,
        mouseLocation,
        setMouseLocation,
    } = useFixtureFocus();

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

    useHotkeys(
        'esc',
        () => {
            clear();
        },
        { keydown: true },
    );

    const { mouseMode } = useMouseMode();

    useEffect(() => {
        if (mouseMode === 'none' || mouseMode === 'command+shift') {
            setHighlightedLocation(undefined);
        } else {
            mouseLocation && setHighlightedLocation(mouseLocation);
        }
    }, [mouseMode]);

    useEffect(() => {
        if (mouseLocation && mouseMode === 'command') {
            setHighlightedLocation(mouseLocation);
        }
    }, [mouseLocation]);

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
        setMouseLocation(toDomainLatLng(e.latlng));
    });

    useEffect(() => {
        if (mouseMode === 'none' || mouseMode === 'command+shift') {
            setHighlightedLocation(undefined);
        } else if (mouseMode === 'command') {
            mouseLocation && setHighlightedLocation(mouseLocation);
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
