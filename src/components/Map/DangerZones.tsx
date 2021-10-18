import { debounce } from "lodash";
import { useState } from "react";
import { Polygon, SVGOverlay, useMap, useMapEvents } from "react-leaflet";
import { AiracData } from "ts-aerodata-france";
import { toLeafletLatLng } from "../../domain";
import { boundingBox } from "../../domain/boundingBox";
import { getMapBounds } from "./getMapBounds";

export const DangerZones = ({ airacData }: { airacData?: AiracData }) => {
  const leafletMap = useMap();
  const [mapBounds, setMapBounds] = useState<[number, number, number, number]>(
    leafletMap && getMapBounds(leafletMap),
  );
  const refreshMapBounds = () => setMapBounds(getMapBounds(leafletMap));
  useMapEvents({
    moveend: refreshMapBounds,
    move: debounce(refreshMapBounds, 100),
  });
  useMapEvents({
    moveend: refreshMapBounds,
    move: debounce(refreshMapBounds, 100),
  });

  return (
    <>
      {mapBounds &&
        airacData
          ?.getDangerZonesInBbox(...mapBounds)
          .filter(({ type }) => ["D", "P"].includes(type))
          .map((zone) => {
            const { geometry } = zone;
            const leafletLatLngs = geometry.map(toLeafletLatLng);

            return (
              <>
                {
                  <>
                    <SVGOverlay
                      attributes={{
                        stroke: "red",
                        class: "map-svg-text-label",
                      }}
                      bounds={boundingBox(leafletLatLngs)}
                      interactive={false}
                    >
                      {/* <text x="0%" y="0%" stroke="#940000" height="100%">
                      {name} ({lowerLimit.toString()} - {higherLimit.toString()})
                    </text> */}
                      <Polygon
                        color="#940000"
                        fillColor="#940000"
                        positions={leafletLatLngs}
                        interactive={false}
                        fill={true}
                      ></Polygon>
                    </SVGOverlay>
                  </>
                }
              </>
            );
          })}
    </>
  );
};
