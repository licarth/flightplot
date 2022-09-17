import type { LatLngTuple } from 'leaflet';
import { LatLng } from 'leaflet';
import { useState } from 'react';
//@ts-ignore
import ReactDistortableImageOverlay from 'react-leaflet-distortable-imageoverlay';
import LFMT_PNG from '../LFMT.png';

export const Chart = () => {
    const topLeft = [43.88, 3.5] as LatLngTuple;
    const bottomRight = [43.15, 4.2] as LatLngTuple;
    const [corners, setCorners] = useState<LatLng[]>(fromTopLeftBottomRight(topLeft, bottomRight));

    return (
        <>
            <ReactDistortableImageOverlay
                url={LFMT_PNG}
                editMode="scale"
                opacity={0.5}
                onCornersUpdated={setCorners}
                // onWellKnownTextUpdated={this.onWellKnownTextUpdated.bind(this)}
                corners={corners}
            />
        </>
    );
};
function fromTopLeftBottomRight(topLeft: LatLngTuple, bottomRight: LatLngTuple) {
    return [
        new LatLng(...topLeft),
        new LatLng(topLeft[0], bottomRight[1]),
        new LatLng(bottomRight[0], topLeft[1]),
        new LatLng(...bottomRight),
    ];
}
