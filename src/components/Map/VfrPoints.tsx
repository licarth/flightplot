import "antd/dist/antd.css";
import CheapRuler from "cheap-ruler";
import { debounce } from "lodash";
import { Fragment, useState } from "react";
import { Polygon, SVGOverlay, useMap, useMapEvents } from "react-leaflet";
import { AiracData, VfrPoint } from "ts-aerodata-france";
import { toLeafletLatLng } from "../../domain";
import { pointToLeafletLatLng, toPoint } from "./FlightPlanningLayer";
import { getMapBounds } from "./getMapBounds";
import { preventDefault } from "./preventDefault";
const ruler = new CheapRuler(43, "nauticalmiles");

export const VfrPoints = ({
  airacData,
  onClick,
}: {
  airacData?: AiracData;
  onClick: (vfrPoint: VfrPoint) => void;
}) => {
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
    components = airacData?.getVfrPointsInBbox(...mapBounds).map((vfrPoint) => {
      const { name, latLng, icaoCode } = vfrPoint;
      const center = toPoint(toLeafletLatLng(latLng));
      const bottomRight = pointToLeafletLatLng(ruler.offset(center, 0.5, -0.5));
      const top = pointToLeafletLatLng(ruler.offset(center, 0, 0.4));
      const left = pointToLeafletLatLng(ruler.offset(center, -0.35, -0.2));
      const right = pointToLeafletLatLng(ruler.offset(center, 0.35, -0.2));

      return (
        <Fragment key={`${icaoCode}/${name}`}>
          {
            <div title={`${icaoCode}`}>
              <SVGOverlay
                attributes={{
                  stroke: "red",
                  class: "map-svg-text-label",
                }}
                bounds={bottomRight.toBounds(100)}
                interactive={true}
                eventHandlers={{
                  click: (e) => {
                    preventDefault(e);
                    onClick(vfrPoint);
                  },
                }}
              >
                <text x="0%" y="0%" stroke="#002e94" height="100%">
                  {name}
                </text>
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
              </SVGOverlay>
            </div>
          }
        </Fragment>
      );
    });
  }
  return <>{components}</>;
};
