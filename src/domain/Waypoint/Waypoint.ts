import * as Codec from "io-ts/lib/Codec";
import * as Decoder from "io-ts/lib/Decoder";
import { Aerodrome, AiracData } from "ts-aerodata-france";
import { v4 as uuidv4 } from "uuid";
import { LatLng } from "../../LatLng";
import { AerodromeWaypoint, AerodromeWaypointType } from "./AerodromeWaypoint";
import { LatLngWaypoint, latLngWaypointCodec } from "./LatLngWaypoint";

export type WaypointProps = {
  latLng: LatLng;
  name: string | null;
  id: string;
  altitude: number | null;
};

// export interface Waypoint {
//   latLng: LatLng;
//   name: string | null;
//   id: string;
//   altitude: number | null;
//   clone: (props: Partial<WaypointProps>) => Waypoint;
// }

export type Waypoint = AerodromeWaypoint | LatLngWaypoint;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export namespace Waypoint {
  export const create = (props: Omit<WaypointProps, "id">) => {
    return new LatLngWaypoint({ ...props, id: uuidv4() });
  };
  export const fromAerodrome = ({
    aerodrome,
    waypointType = AerodromeWaypointType.RUNWAY,
  }: {
    aerodrome: Aerodrome;
    waypointType: AerodromeWaypointType;
  }) => {
    return new AerodromeWaypoint({
      aerodrome,
      waypointType,
      altitude: null,
    });
  };
}

export const waypointCodec = (
  airacData: AiracData,
) =>
  Codec.make(
    Decoder.union(latLngWaypointCodec, AerodromeWaypoint.codec(airacData)),
    {
      encode: (a) => {
        if (AerodromeWaypoint.isAerodromeWaypoint(a)) {
          return AerodromeWaypoint.codec(airacData).encode(a);
        } else {
          return latLngWaypointCodec.encode(a);
        }
      },
    },
  );

// const isAerodromeProps = (a: any): a is AerodromeWaypoint => {
//   return a.icaoCode !== undefined;
// };
