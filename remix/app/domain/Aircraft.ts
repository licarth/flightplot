export interface Aircraft {
    climbRateFeetMin: number;
    descentRateFeetMin: number;
    cruiseKIAS: number;
    climbKIAS: number;
    name: string;
}

export const aircraftCollection: Aircraft[] = [
    {
        name: 'DA-20',
        cruiseKIAS: 100,
        descentRateFeetMin: 1000,
        climbRateFeetMin: 1000,
        climbKIAS: 72,
    },
];
