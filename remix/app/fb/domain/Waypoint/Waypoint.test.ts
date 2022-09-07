import { right } from "fp-ts/lib/Either";
import { AiracCycles, AiracData } from "ts-aerodata-france";
import { AerodromeWaypoint, AerodromeWaypointType } from "./AerodromeWaypoint";
import { LatLngWaypoint } from "./LatLngWaypoint";
import { waypointCodec } from "./Waypoint";

describe("waypointCodec", () => {
  it("should properly encode/decode a LatLngWaypoint", () => {
    const airacData = AiracData.loadCycle(AiracCycles.AUG_11_2022);
    const waypoint = LatLngWaypoint.create({
      altitude: 1000,
      latLng: { lat: 1, lng: 1 },
      id: "anId",
      name: "aName",
    });
    expect(
      waypointCodec(airacData).decode(waypointCodec(airacData).encode(waypoint))
    ).toEqual(right(waypoint));
  });

  it("should properly encode/decode an Aerodrome Waypoint", () => {
    const airacData = AiracData.loadCycle(AiracCycles.AUG_11_2022);
    const waypoint = new AerodromeWaypoint({
      aerodrome: airacData.aerodromes[21],
      altitude: null,
      waypointType: AerodromeWaypointType.RUNWAY,
    });
    expect(
      waypointCodec(airacData).decode(waypointCodec(airacData).encode(waypoint))
    ).toEqual(right(waypoint));
  });
});
