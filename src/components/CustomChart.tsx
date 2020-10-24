import { sequenceS } from "fp-ts/lib/Apply";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { getCenter, getDistance } from "geolib";
import { GeolibInputCoordinates } from "geolib/es/types";
import { LatLng, LatLngTuple, Map, Point, PointExpression } from "leaflet";
import React, { createRef, useState } from "react";
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

const scale = ({
  lastPosition,
  newTopLeft = null,
  newTopRight = null,
  map,
}: {
  lastPosition: ChartPosition;
  newTopLeft?: LatLngTuple | null;
  newTopRight?: LatLngTuple | null;
  map: Map;
}): E.Either<Error, ChartPosition> => {
  const center = centerOf([lastPosition.topLeft, lastPosition.bottomRight]);
  const centerPoint = pipe(center, map.latLngToLayerPoint.bind(map));
  const lastPoint = newTopLeft
    ? lastPosition.topLeft
    : lastPosition.bottomRight;
  const newPoint = newTopLeft ? newTopLeft : newTopRight;

  if (newPoint === null) {
    return E.left(new Error("Should never happen"));
  }

  const scalingFactor = calculateScalingFactor(
    lastPoint,
    newPoint,
    {
      lat: center[0],
      lng: center[1],
    } as LatLng,
    map,
  );

  const calculateNewPosition = (
    latLng: LatLngTuple,
    centerPoint: PointExpression,
    scalingFactor: number,
  ) => {
    const a = map
      .latLngToLayerPoint(latLng)
      .subtract(centerPoint)
      .multiplyBy(scalingFactor)
      .add(centerPoint);
    return map.layerPointToLatLng(a);
    // return { lat: latLng[0], lng: latLng[1] };
  };

  const result = pipe(
    {
      bottomRight: calculateNewPosition(
        lastPosition.bottomRight,
        centerPoint,
        scalingFactor,
      ),
      topLeft: calculateNewPosition(
        lastPosition.topLeft,
        centerPoint,
        scalingFactor,
      ),
    },
    ({ topLeft, bottomRight }) => ({
      topLeft: [topLeft.lat, topLeft.lng],
      bottomRight: [bottomRight.lat, bottomRight.lng],
    }),
  );

  //@ts-ignore
  return E.right(result);
};

export const Chart = ({ map }: { map: Map }) => {
  const [chartPosition, setChartPosition] = useState<ChartPosition>({
    topLeft: [43.88, 3.5],
    bottomRight: [43.15, 4.2],
  });
  const topLeftMarkerRef = createRef<Marker>();
  const bottomRightMarkerRef = createRef<Marker>();
  const imageOverlayRef = createRef<ImageOverlay>();
  const { topLeft, bottomRight } = chartPosition;
  const bounds = [topLeft, bottomRight];

  return (
    <>
      <ImageOverlay
        ref={imageOverlayRef}
        bounds={bounds}
        url={LFMT_PNG}
        opacity={1}
        interactive
      />
      <Marker
        draggable
        position={chartPosition.topLeft}
        ref={topLeftMarkerRef}
        ondrag={(e) => {
          if (topLeftMarkerRef.current) {
            const {
              lat,
              lng,
            } = topLeftMarkerRef.current.leafletElement.getLatLng();
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
            setChartPosition(newPositions);
          }
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
