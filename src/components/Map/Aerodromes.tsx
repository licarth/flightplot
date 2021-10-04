import "antd/dist/antd.css";
import { debounce } from "lodash";
import { Fragment, useState } from "react";
import { SVGOverlay, useMap, useMapEvents } from "react-leaflet";
import styled from "styled-components";
import { Aerodrome, AiracData } from "ts-aerodata-france";
import { MagneticRunwayOrientation } from "ts-aerodata-france/build/types/domain/Runway";
import { ReactComponent as AerodromeLogo } from "../../icons/aerodrome.min.svg";
import { toLatLng } from "./LeafletMap";
import { preventDefault } from "./preventDefault";

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
                <text
                  x="50%"
                  y="120%"
                  style={{ textAnchor: "middle" }}
                  stroke="#002e94"
                >
                  {aerodrome.mapShortName}
                </text>
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
