//MyComponent.jsx
import { useLeafletContext } from '@react-leaflet/core';
import * as L from 'leaflet';
import React from 'react';
import { useMainMap } from './MainMapContext';

export const LayerSwitchButton = () => {
    const { nextBackgroundLayer } = useMainMap();

    const context = useLeafletContext();
    const control = L.Control.extend({
        //...options
        options: {
            position: 'topright',
        },
        onAdd: function (map) {
            var button = L.DomUtil.create('div');

            button.style.width = '30px';
            button.style.height = '30px';
            button.style.fontSize = '1.5em';
            button.style.display = 'flex';
            button.style.justifyContent = 'center';
            button.style.alignItems = 'center';
            button.style.backgroundColor = 'white';
            button.style.cursor = 'pointer';

            button.append('🗺');
            button.onclick = (e) => {
                e.stopPropagation();
                e.preventDefault();
                nextBackgroundLayer();
            };

            return button;
        },
        onRemove: function (map) {
            // Nothing to do here
        },
    });

    React.useEffect(() => {
        const c = new control();
        const container = context.layerContainer || context.map;
        //@ts-ignore
        container.addControl(c);

        return () => {
            //@ts-ignore
            container.removeControl(c);
        };
    });

    return null;
};
