import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { getCenter } from "geolib";
import { GeolibInputCoordinates } from "geolib/es/types";
import Leaflet, { LatLng, LatLngTuple, Map, Point } from "leaflet";
import React, { useRef, useState } from "react";
import { ImageOverlay, Marker } from "react-leaflet";
import LFMT_PNG from "../LFMT.png";

type ChartPosition = {
  topLeft: LatLngTuple;
  bottomRight: LatLngTuple;
};

const toGeoLibCoordinates = (
  lantLngTuple: LatLngTuple,
): GeolibInputCoordinates => ({ lat: lantLngTuple[0], lon: lantLngTuple[1] });

const toLatLngTuple = ({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}): LatLngTuple => [latitude, longitude];

const centerOf = (coordinates: LatLngTuple[]): LatLngTuple => {
  const centerOfFalse = getCenter(coordinates.map(toGeoLibCoordinates));
  if (centerOfFalse) {
    return toLatLngTuple(centerOfFalse);
  }
  throw new Error("Could not get center of 2 coordinates");
};

const _d2 = (a: Point, b: Point) => {
  var dx = a.x - b.x,
    dy = a.y - b.y;

  return Math.pow(dx, 2) + Math.pow(dy, 2);
};

const calculateScalingFactor = (
  latlngA: LatLngTuple,
  latlngB: LatLngTuple,
  center: LatLng,
  map: Map,
) => {
  const centerPoint = map.latLngToLayerPoint(center);
  const formerPoint = map.latLngToLayerPoint(latlngA);
  const newPoint = map.latLngToLayerPoint(latlngB);

  const formerRadiusSquared = _d2(centerPoint, formerPoint);
  const newRadiusSquared = _d2(centerPoint, newPoint);

  return Math.sqrt(newRadiusSquared / formerRadiusSquared);
};

const translate = ({
  previousChartPosition,
  previousMarkerPosition,
  newMarkerPosition,
}: {
  previousChartPosition: ChartPosition;
  previousMarkerPosition: LatLngTuple;
  newMarkerPosition: LatLngTuple;
}): ChartPosition => {
  const deltaLat = newMarkerPosition[0] - previousMarkerPosition[0];
  const deltaLng = newMarkerPosition[1] - previousMarkerPosition[1];
  return {
    bottomRight: [
      previousChartPosition.bottomRight[0] + deltaLat,
      previousChartPosition.bottomRight[1] + deltaLng,
    ],
    topLeft: [
      previousChartPosition.topLeft[0] + deltaLat,
      previousChartPosition.topLeft[1] + deltaLng,
    ],
  };
};

const scale = ({
  lastPosition,
  newTopLeft,
  map,
}: {
  lastPosition: ChartPosition;
  newTopLeft: LatLngTuple;
  map: Map;
}): E.Either<Error, ChartPosition> => {
  return E.right({
    topLeft: newTopLeft,
    bottomRight: lastPosition.bottomRight,
  });
};

export const Chart = ({ map }: { map: Map }) => {
  const [chartPosition, setChartPosition] = useState<ChartPosition>({
    topLeft: [43.922119317999055, 3.764877319335938],
    bottomRight: [43.42300370191848, 4.205703735351563],
  });
  const topLeftMarkerRef = useRef<Leaflet.Marker>(null);
  const translationMarkerRef = useRef<Leaflet.Marker>(null);
  const imageOverlayRef = useRef<Leaflet.ImageOverlay>(null);
  const { topLeft, bottomRight } = chartPosition;
  const bounds = [topLeft, bottomRight];
  return (
    <>
      <ImageOverlay
        ref={imageOverlayRef}
        bounds={bounds}
        url={LFMT_PNG}
        opacity={1}
        // zIndex={1000}
      />
      {/* <Rectangle
        bounds={bounds}
        fill
        stroke
        fillColor="white"
        fillOpacity={1}
        /> */}
      <Marker
        draggable
        // icon={}
        ref={translationMarkerRef}
        position={chartPosition.bottomRight}
        eventHandlers={{
          drag: (e) => {
            if (translationMarkerRef.current) {
              const { lat, lng } = translationMarkerRef.current.getLatLng();

              const newMarkerPosition = [lat, lng] as LatLngTuple;
              const newPosition = translate({
                previousChartPosition: chartPosition,
                newMarkerPosition,
                previousMarkerPosition: chartPosition.bottomRight,
              });
              setChartPosition(newPosition);
            }
          },
        }}
      />
      <Marker
        draggable
        position={chartPosition.topLeft}
        ref={topLeftMarkerRef}
        eventHandlers={{
          drag: (e) => {
            if (topLeftMarkerRef.current) {
              const { lat, lng } = topLeftMarkerRef.current.getLatLng();
              const newTopLeft = [lat, lng] as LatLngTuple;
              const newPositions = pipe(
                scale({
                  lastPosition: chartPosition,
                  newTopLeft,
                  map,
                }),
                E.fold(
                  () => chartPosition,
                  (a) => a,
                ),
              );
              // setChartPosition({newPositions});
              setChartPosition({
                topLeft: newTopLeft,
                bottomRight: newPositions.bottomRight,
              });
            }
          },
        }}
      />
      {/* <Marker
        draggable
        position={bottomRight}
        ref={bottomRightMarkerRef}
        ondrag={(e) => {
          if (bottomRightMarkerRef.current) {
            const {
              lat,
              lng,
            } = bottomRightMarkerRef.current.leafletElement.getLatLng();
            setBottomRight([lat, lng]);
          }
        }}
      /> */}
    </>
  );
};
