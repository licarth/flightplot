import { debounce } from "lodash";
import { Fragment, useState } from "react";
import {
  Polygon,
  SVGOverlay,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";
import styled from "styled-components";
import { Aerodrome, MagneticRunwayOrientation } from "ts-aerodata-france";
import { ReactComponent as AerodromeLogo } from "../../icons/aerodrome.min.svg";
import { toLatLng } from "../../LatLng";
import { useAiracData } from "../useAiracData";
import { getMapBounds } from "./getMapBounds";
import { preventDefault } from "./preventDefault";

export const Aerodromes = ({
  onClick,
}: {
  onClick: (aerodrome: Aerodrome) => void;
}) => {
  const { airacData } = useAiracData();
  const leafletMap = useMap();
  const [mapBounds, setMapBounds] = useState<[number, number, number, number]>(
    leafletMap && getMapBounds(leafletMap),
  );
  const displayAerodromesLabels = leafletMap.getZoom() > 8;
  const refreshMapBounds = () => setMapBounds(getMapBounds(leafletMap));
  useMapEvents({
    moveend: refreshMapBounds,
    move: debounce(refreshMapBounds, 100),
  });
  return (
    <>
      {mapBounds &&
        airacData.getAerodromesInBbox(...mapBounds).map((aerodrome) => {
          const {
            latLng,
            icaoCode,
            magneticVariation,
            runways: {
              mainRunway: { magneticOrientation },
            },
          } = aerodrome;
          const l = toLatLng(latLng);

          return (
            <Fragment key={`ad-${icaoCode}`}>
              <SVGOverlay
                key={`aerodrome-${icaoCode}`}
                interactive={true}
                bounds={[
                  [l.lat + 0.02, l.lng - 0.02],
                  [l.lat - 0.02, l.lng + 0.02],
                ]}
                attributes={{ class: "map-svg-text-label" }}
                eventHandlers={{
                  click: (e) => {
                    preventDefault(e);
                    onClick(aerodrome);
                  },
                }}
              >
                {
                  <StyledAerodromeLogo
                    title={`${icaoCode}`}
                    $magneticVariation={magneticVariation}
                    $magneticOrientation={magneticOrientation}
                  />
                }
                {/* <text
                  x="50%"
                  y="120%"
                  style={{ textAnchor: "middle" }}
                  stroke="#002e94"
                >
                  {aerodrome.mapShortName}
                </text> */}
                {displayAerodromesLabels && (
                  <Polygon
                    fill={false}
                    fillOpacity={0}
                    opacity={0}
                    positions={[[l.lat - 0.015, l.lng]]}
                  >
                    <StyledTooltip
                      key={`tooltip-wpt-${icaoCode}-${aerodrome.mapShortName}`}
                      permanent
                      direction={"bottom"}
                    >
                      {aerodrome.mapShortName}
                    </StyledTooltip>
                  </Polygon>
                )}
              </SVGOverlay>
            </Fragment>
          );
        })}
    </>
  );
};

const StyledAerodromeLogo = styled(AerodromeLogo)<{
  $magneticVariation: number;
  $magneticOrientation: MagneticRunwayOrientation;
}>`
  #magnetic-variation {
    transform-origin: center;
    transform: ${(props) => `rotate(${props.$magneticVariation}deg)`};
  }
  #runway {
    transform-origin: center;
    transform: ${(props) => `rotate(${props.$magneticOrientation}deg)`};
  }
`;

const StyledTooltip = styled(Tooltip)`
  background-color: transparent;
  box-shadow: unset;
  background-color: none;
  border: none;
  border-radius: none;
  color: #002e94;
  text-shadow: -2px 0 white, 0 2px white, 2px 0 white, 0 -2px white;
  white-space: nowrap;
  font-weight: bold;
  text-align: left;
  margin: 0px;
  padding-top: 0px;

  ::before {
    display: none;
  }
`;
