import "antd/dist/antd.css";
import CheapRuler from "cheap-ruler";
import { debounce } from "lodash";
import { useState } from "react";
import { SVGOverlay, useMap, useMapEvents } from "react-leaflet";
import { Aerodrome, AiracData } from "sia-data";
import { MagneticRunwayOrientation } from "sia-data/build/types/domain/Runway";
import styled from "styled-components";
import { ReactComponent as AerodromeLogo } from "../../icons/aerodrome.min.svg";
import { toLatLng } from "./LeafletMap";
import { preventDefault } from "./preventDefault";
const ruler = new CheapRuler(43, "nauticalmiles");

export const Aerodromes = ({
  airacData,
  onClick,
}: {
  airacData?: AiracData;
  onClick: (aerodrome: Aerodrome) => void;
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
        airacData?.getAerodromesInBbox(...mapBounds).map((aerodrome) => {
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
            <>
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
                    magneticVariation={magneticVariation}
                    magneticOrientation={magneticOrientation}
                  />
                }
                <text
                  x="50%"
                  y="120%"
                  style={{ textAnchor: "middle" }}
                  stroke="#002e94"
                >
                  {aerodrome.mapShortName}
                </text>
              </SVGOverlay>
            </>
          );
        })}
    </>
  );
};

const StyledAerodromeLogo = styled(AerodromeLogo)<{
  magneticVariation: number;
  magneticOrientation: MagneticRunwayOrientation;
}>`
  #magnetic-variation {
    transform-origin: center;
    transform: ${(props) => `rotate(${props.magneticVariation}deg)`};
  }
  #runway {
    transform-origin: center;
    transform: ${(props) => `rotate(${props.magneticOrientation}deg)`};
  }
`;
