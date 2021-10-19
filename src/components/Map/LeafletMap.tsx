import { NmScale } from "@marfle/react-leaflet-nmscale";
import { LatLngTuple } from "leaflet";
import { useRef } from "react";
import { MapContainer } from "react-leaflet";
import styled from "styled-components";
import { AiracData } from "ts-aerodata-france";
import { DisplayedLayers } from "../../App";
import { toLeafletLatLng } from "../../domain";
import Modal from "../../Modal";
import { OaciLayer, OpenStreetMapLayer } from "../layer";
import { useRoute } from "../useRoute";
import { VerticalProfileChart } from "../VerticalProfileChart";
import { Aerodromes } from "./Aerodromes";
import { Airspaces } from "./Airspaces";
import { DangerZones } from "./DangerZones";
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

  const vpModal = useRef(null);

  return (
    <>
      <BackgroundContainer onContextMenu={(e) => e.preventDefault()}>
        <LeftMenu airacData={airacData} />
        <RightSide>
          <MapContainer id="mapId" {...params}>
            <Layers displayedLayers={displayedLayers} />
            <FlightPlanningLayer />
            <Airspaces airacData={airacData} />
            <DangerZones airacData={airacData} />
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
            <NmScale />
          </MapContainer>
          {/* @ts-ignore */}
          <VerticalProfileDiv onClick={() => vpModal.current?.open()}>
            <VerticalProfileChart airacData={airacData} />
          </VerticalProfileDiv>
          <Modal fade={false} defaultOpened={false} ref={vpModal}>
            <VerticalProfileModalDiv>
              <VerticalProfileChart airacData={airacData} />
            </VerticalProfileModalDiv>
          </Modal>
        </RightSide>
      </BackgroundContainer>
    </>
  );
};

const RightSide = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 0 auto;
`;

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
  width: 100%;
`;

const VerticalProfileDiv = styled.div`
  width: 100%;
  height: 300px;
  background-color: white;
  overflow: hidden;
`;

const VerticalProfileModalDiv = styled.div`
  width: 80vw;
  height: 80vh;
  z-index: 10000;

  @media print {
    width: 100%;
    height: 100%;
  }
`;
