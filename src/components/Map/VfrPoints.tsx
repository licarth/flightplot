import "antd/dist/antd.css";
import CheapRuler from "cheap-ruler";
import { debounce } from "lodash";
import { Fragment, useState } from "react";
import { Polygon, SVGOverlay, useMap, useMapEvents } from "react-leaflet";
import { AiracData } from "ts-aerodata-france";
import { VfrPoint } from "ts-aerodata-france/build/types/domain/VfrPoint";
import { toLeafletLatLng } from "../../domain";
import { pointToLeafletLatLng, toPoint } from "./FlightPlanningLayer";
import { preventDefault } from "./preventDefault";
const ruler = new CheapRuler(43, "nauticalmiles");

export const VfrPoints = ({
  airacData,
  onClick,
}: {
  airacData?: AiracData;
  onClick: (vfrPoint: VfrPoint) => void;
}) => {
  const [mapBounds, setMapBounds] =
    useState<[number, number, number, number]>();
  const leafletMap = useMap();
  const refreshMapBounds = () =>
    setMapBounds([
      leafletMap.getBounds().getWest(),
      leafletMap.getBounds().getSouth(),
      leafletMap.getBounds().getEast(),
      leafletMap.getBounds().getNorth(),
    ]);
  useMapEvents({
    moveend: refreshMapBounds,
    move: debounce(refreshMapBounds, 100),
  });
  return (
    <>
      {mapBounds &&
        airacData?.getVfrPointsInBbox(...mapBounds).map((vfrPoint) => {
          const { name, latLng, icaoCode } = vfrPoint;
          const center = toPoint(toLeafletLatLng(latLng));
          const bottomRight = pointToLeafletLatLng(
            ruler.offset(center, 0.5, -0.5),
          );
          const top = pointToLeafletLatLng(ruler.offset(center, 0, 0.4));
          const left = pointToLeafletLatLng(ruler.offset(center, -0.35, -0.2));
          const right = pointToLeafletLatLng(ruler.offset(center, 0.35, -0.2));

          return (
            <Fragment key={`${icaoCode}/${name}`}>
              {
                <>
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
                </>
              }
            </Fragment>
          );
        })}
    </>
  );
};
