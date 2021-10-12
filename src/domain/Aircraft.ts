export interface Aircraft {
  climbRateFeetSecond: number;
  descentRateFeetSecond: number;
  cruiseKIAS: number;
  climbKIAS: number;
  name: string;
}

export const aircraftCollection: Aircraft[] = [
  {
    name: "DA-20",
    cruiseKIAS: 110,
    descentRateFeetSecond: 500,
    climbRateFeetSecond: 800,
    climbKIAS: 72,
  },
];
