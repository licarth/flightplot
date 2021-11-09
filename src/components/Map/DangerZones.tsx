import { Polygon, SVGOverlay } from "react-leaflet";
import { toLeafletLatLng } from "../../domain";
import { boundingBox } from "../../domain/boundingBox";
import { useAiracData } from "../useAiracData";
import { MapBounds } from "./DisplayedContent";

export const DangerZones = ({ mapBounds }: { mapBounds: MapBounds }) => {
  const { airacData } = useAiracData();

  return (
    <>
      {mapBounds &&
        airacData
          .getDangerZonesInBbox(...mapBounds)
          .filter(({ type }) => ["D", "P"].includes(type))
          .map((zone, i) => {
            const { geometry } = zone;
            const leafletLatLngs = geometry.map(toLeafletLatLng);

            return (
              <SVGOverlay
                key={`dangerZone-${i}-${zone.name}`}
                attributes={{
                  stroke: "red",
                  class: "map-svg-text-label",
                }}
                bounds={boundingBox(leafletLatLngs)}
                interactive={false}
              >
                <Polygon
                  color="#940000"
                  fillColor="#940000"
                  positions={leafletLatLngs}
                  interactive={false}
                  fill={true}
                ></Polygon>
              </SVGOverlay>
            );
          })}
    </>
  );
};
