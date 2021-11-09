import { NmScale } from "@marfle/react-leaflet-nmscale";
import { LatLngTuple } from "leaflet";
import { useState } from "react";
import { MapContainer, useMap, useMapEvents } from "react-leaflet";
import { toLeafletLatLng } from "../../domain";
import { OaciLayer } from "../layer";
import { useRoute } from "../useRoute";
import { Aerodromes } from "./Aerodromes";
import { Airspaces } from "./Airspaces";
import { DangerZones } from "./DangerZones";
import { FlightPlanningLayer } from "./FlightPlanningLayer";
import { getMapBounds } from "./getMapBounds";
import { VfrPoints } from "./VfrPoints";

const defaultLatLng: LatLngTuple = [43.5, 3.95];
const zoom: number = 8;

const InnerMapContainer = () => {
  const { addAerodromeWaypoint, addLatLngWaypoint } = useRoute();
  const leafletMap = useMap();
  const [mapBounds, setMapBounds] = useState<[number, number, number, number]>(
    leafletMap && getMapBounds(leafletMap),
  );
  const refreshMapBounds = () => setMapBounds(getMapBounds(leafletMap));
  useMapEvents({
    zoomend: refreshMapBounds,
    moveend: refreshMapBounds,
  });
  const shouldRenderAerodromes = leafletMap.getZoom() > 7;
  const shouldRenderVfrPoints = leafletMap.getZoom() > 9;
  return (
    <>
      <Layers />
      <FlightPlanningLayer />
      <Airspaces mapBounds={mapBounds} />
      <DangerZones mapBounds={mapBounds} />
      {shouldRenderAerodromes && (
        <Aerodromes
          mapBounds={mapBounds}
          onClick={(aerodrome) => addAerodromeWaypoint({ aerodrome })}
        />
      )}
      {shouldRenderVfrPoints && (
        <VfrPoints
          mapBounds={mapBounds}
          onClick={({ latLng, name }) =>
            addLatLngWaypoint({ latLng: toLeafletLatLng(latLng), name })
          }
        />
      )}
      <NmScale />
    </>
  );
};

const Layers = () => {
  return (
    <>
      {/* <OpenStreetMapLayer /> */}
      <OaciLayer />
    </>
  );
};

export const LeafletMapContainer = () => {
  const params = { center: defaultLatLng, zoom };

  return (
    <MapContainer id="mapId" {...params}>
      <InnerMapContainer />
    </MapContainer>
  );
};
