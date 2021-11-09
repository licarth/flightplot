import CheapRuler, { Point } from "cheap-ruler";
import { debounce } from "lodash";
import { Fragment, useState } from "react";
import {
  Polygon,
  SVGOverlay,
  Tooltip,
  useMap,
  useMapEvents
} from "react-leaflet";
import styled from "styled-components";
import { VfrPoint } from "ts-aerodata-france";
import { toLeafletLatLng } from "../../domain";
import { useAiracData } from "../useAiracData";
import { pointToLeafletLatLng, toCheapRulerPoint } from "./FlightPlanningLayer";
import { getMapBounds } from "./getMapBounds";
import { preventDefault } from "./preventDefault";
const ruler = new CheapRuler(43, "nauticalmiles");

export const VfrPoints = ({
  onClick,
}: {
  onClick: (vfrPoint: VfrPoint) => void;
}) => {
  const { airacData } = useAiracData();
  const leafletMap = useMap();
  const [mapBounds, setMapBounds] = useState<[number, number, number, number]>(
    leafletMap && getMapBounds(leafletMap),
  );
  const refreshMapBounds = () => setMapBounds(getMapBounds(leafletMap));
  useMapEvents({
    moveend: refreshMapBounds,
    move: debounce(refreshMapBounds, 100),
  });
  let components: JSX.Element[] | undefined = [];
  if (!!mapBounds) {
    components = airacData.getVfrPointsInBbox(...mapBounds).map((vfrPoint) => {
      const { name, latLng, icaoCode } = vfrPoint;
      const center = toCheapRulerPoint(toLeafletLatLng(latLng));
      const bottomRight = pointToLeafletLatLng(ruler.offset(center, 0.5, -0.5));
      const top = pointToLeafletLatLng(ruler.offset(center, 0, 0.4));
      const left = pointToLeafletLatLng(ruler.offset(center, -0.35, -0.2));
      const right = pointToLeafletLatLng(ruler.offset(center, 0.35, -0.2));

      const bounds = boxAround(toCheapRulerPoint(bottomRight), 10);
      return (
        <Fragment key={`${icaoCode}/${name}`}>
          {
            <div title={`${icaoCode}`}>
              <SVGOverlay
                attributes={{
                  stroke: "red",
                  class: "map-svg-text-label",
                }}
                bounds={bounds}
                interactive={true}
                eventHandlers={{
                  click: (e) => {
                    preventDefault(e);
                    onClick(vfrPoint);
                  },
                }}
              >
                <Polygon
                  color="#002e94"
                  positions={[top, left, right]}
                  eventHandlers={{
                    click: (e) => {
                      preventDefault(e);
                      onClick(vfrPoint);
                    },
                  }}
                ></Polygon>
                <Polygon color="#002e94" positions={[right]}>
                  <StyledTooltip
                    key={`tooltip-wpt-${icaoCode}-${name}`}
                    permanent
                    direction={"right"}
                  >
                    {name}
                  </StyledTooltip>
                </Polygon>
              </SVGOverlay>
            </div>
          }
        </Fragment>
      );
    });
  }
  return <>{components}</>;
};

const boxAround = (point: Point, radiusInMeters: number) => {
  const ruler = new CheapRuler(point[1], "meters");
  return [
    ruler.destination(point, radiusInMeters, 225),
    ruler.destination(point, radiusInMeters, 45),
  ].map(([lng, lat]) => [lat, lng] as [number, number]);
};

const StyledTooltip = styled(Tooltip)`
  background-color: transparent;
  box-shadow: unset;
  background-color: none;
  border: none;
  border-radius: none;
  color: #002e94;
  -webkit-text-stroke: 0.5px white;
  white-space: nowrap;
  font-weight: 1000;
  text-shadow: -2px 0 white, 0 2px white, 2px 0 white, 0 -2px white;
  text-align: left;
  margin: 0px;

  ::before {
    display: none;
  }
`;
