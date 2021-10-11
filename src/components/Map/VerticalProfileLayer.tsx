import { debounce } from "lodash";
import { useState } from "react";
import { Polyline, useMap, useMapEvents } from "react-leaflet";
import { AiracData, AirspaceType } from "ts-aerodata-france";
import { Route } from "../../domain";
import { routeAirspaceOverlapsGraphical } from "../../domain/VerticalProfileGraphical";

export const VerticalProfileLayer = ({
  airacData,
  route,
}: {
  airacData?: AiracData;
  route: Route;
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
  const routeBbox = route.boundingBox;
  return (
    <>
      {airacData &&
        mapBounds &&
        routeAirspaceOverlapsGraphical({
          route,
          airspaces: airacData
            .getAirspacesInBbox(...routeBbox)
            .filter(({ type }) => type === AirspaceType.CTR),
        }).map((lineStrings) => {
          const positions = lineStrings.map((lineString) =>
            lineString.coordinates.map(([lat, lng]) => [lng, lat]),
          ) as unknown as [[[number, number]]];
          return positions.map((p) => (
            <Polyline
              pathOptions={{ color: "orange", weight: 10 }}
              positions={p}
            ></Polyline>
          ));
        })}
    </>
  );
};
