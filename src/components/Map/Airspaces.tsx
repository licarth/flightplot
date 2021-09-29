import "antd/dist/antd.css";
import { debounce } from "lodash";
import { Fragment, useState } from "react";
import {
  Polygon,
  SVGOverlay,
  Tooltip,
  useMap,
  useMapEvents
} from "react-leaflet";
import { AiracData, Airspace, AirspaceType } from "ts-aerodata-france";
import { toLeafletLatLng } from "../../domain";

const AirspaceSvg = ({ airspace }: { airspace: Airspace }) => {
  const { geometry, name, lowerLimit, higherLimit, airspaceClass, type } = airspace;
  const leafletLatLngs = geometry.map(toLeafletLatLng);
  const [mouseOver, setMouseOver] = useState(false);
  const color = "#002e94";
  return (
    <Fragment key={`airspace-${name}`}>
      {
        <>
          <SVGOverlay
            attributes={{
              stroke: "red",
              class: "map-svg-text-label",
            }}
            bounds={leafletLatLngs[0].toBounds(100)}
          >
            <Polygon
              positions={leafletLatLngs}
              interactive={true}
              pathOptions={{
                color,
                fillColor: color,
                stroke: true,
                fillOpacity: mouseOver ? 0.3 : 0.2,
                dashArray: [30, 10],
                weight: mouseOver ? 4 : 2,
              }}
              eventHandlers={{
                mouseover: () => {
                  setMouseOver(true);
                },
                mouseout: () => {
                  setMouseOver(false);
                },
              }}
            >
              <Tooltip
                sticky
                opacity={0.8}
                offset={[10, 0]}
                key={`tooltip-airspace-${name}`}
              >
                <b>{name} [{airspaceClass}]</b>
                <br />
                <div
                  style={{
                    textAlign: "center",
                    fontStyle: "italic",
                    backgroundColor: "grey",
                    color: "white",
                  }}
                >
                  {higherLimit.toString()}
                  <hr />
                  {lowerLimit.toString()}
                </div>
              </Tooltip>
            </Polygon>
          </SVGOverlay>
        </>
      }
    </Fragment>
  );
};

export const Airspaces = ({ airacData }: { airacData?: AiracData }) => {
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
        airacData
          ?.getAirspacesInBbox(...mapBounds)
          .filter(({ type }) => type === AirspaceType.CTR)
          .map((airspace) => (
            <AirspaceSvg
              airspace={airspace}
              key={`${airspace.type}-${airspace.name}`}
            />
          ))}
    </>
  );
};
