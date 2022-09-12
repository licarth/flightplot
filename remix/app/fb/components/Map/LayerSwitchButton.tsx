//MyComponent.jsx
import { useLeafletContext } from '@react-leaflet/core';
import * as L from 'leaflet';
import React, { useRef } from 'react';
import styled from 'styled-components';
import { useMainMap } from './MainMapContext';

export const LayerSwitchButton = () => {
    const { nextBackgroundLayer } = useMainMap();
    const ref = useRef<HTMLDivElement>(null);

    const context = useLeafletContext();
    const control = L.Control.extend({
        //...options
        options: {
            position: 'topleft',
        },
        onAdd: function () {
            return ref.current;
        },
        onRemove: function () {
            // Nothing to do here
        },
    });

    React.useEffect(() => {
        const c = new control();
        // const container = context.layerContainer || context.map;
        const container = context.map;
        container.addControl(c);

        return () => {
            container.removeControl(c);
        };
    });

    return (
        <StyledLayerSwitchButton
            ref={ref}
            onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                nextBackgroundLayer();
            }}
        >
            🗺
        </StyledLayerSwitchButton>
    );
};

const StyledLayerSwitchButton = styled.div`
    width: 30px;
    height: 30px;
    font-size: 1.5em;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: white;
    cursor: pointer;
`;
