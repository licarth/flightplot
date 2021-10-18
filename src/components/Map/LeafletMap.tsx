import { NmScale } from "@marfle/react-leaflet-nmscale";
import { LatLngTuple } from "leaflet";
import { MapContainer } from "react-leaflet";
import styled from "styled-components";
import { AiracData } from "ts-aerodata-france";
import { DisplayedLayers } from "../../App";
import { toLeafletLatLng } from "../../domain";
import { OaciLayer, OpenStreetMapLayer } from "../layer";
import { useRoute } from "../useRoute";
import { Aerodromes } from "./Aerodromes";
import { Airspaces } from "./Airspaces";
import { FlightPlanningLayer } from "./FlightPlanningLayer";
import { LeftMenu } from "./LeftMenu";
import { VfrPoints } from "./VfrPoints";
const defaultLatLng: LatLngTuple = [43.5, 3.95];
const zoom: number = 11;

type LeafletMapProps = {
  displayedLayers: DisplayedLayers;
  airacData: AiracData;
};

export const LeafletMap = ({ displayedLayers, airacData }: LeafletMapProps) => {
  const { route, addAerodromeWaypoint, addLatLngWaypoint } = useRoute();

  const params =
    route.waypoints.length > 1 && route.leafletBoundingBox
      ? { bounds: route.leafletBoundingBox }
      : { center: defaultLatLng, zoom };

  return (
    <>
      <BackgroundContainer onContextMenu={(e) => e.preventDefault()}>
        <LeftMenu airacData={airacData} />
        <MapContainer id="mapId" {...params}>
          <Layers displayedLayers={displayedLayers} />
          <Airspaces airacData={airacData} />
          {/* <DangerZones airacData={airacData} /> */}
          <Aerodromes
            airacData={airacData}
            onClick={(aerodrome) => addAerodromeWaypoint({ aerodrome })}
          />
          <VfrPoints
            airacData={airacData}
            onClick={({ latLng, name }) =>
              addLatLngWaypoint({ latLng: toLeafletLatLng(latLng), name })
            }
          />
          <FlightPlanningLayer />
          <NmScale />
        </MapContainer>
      </BackgroundContainer>
    </>
  );
};

const Layers = ({ displayedLayers }: { displayedLayers: DisplayedLayers }) => {
  return (
    <>
      {displayedLayers.open_street_map && <OpenStreetMapLayer />}
      {displayedLayers.icao && <OaciLayer />}
    </>
  );
};

const BackgroundContainer = styled.div`
  display: flex;
`;
