import type { ICloud, Visibility } from 'metar-taf-parser';
import { CloudQuantity, DistanceUnit, parseMetar } from 'metar-taf-parser';
import type { WeatherInfo } from './Aerodromes';

export const getWeatherInfoFromMetar = (metarString: string): Omit<WeatherInfo, 'display'> => {
    const metar = parseMetar(metarString);
    const { visibility, clouds, verticalVisibility } = metar;
    const flightCategory = getFlightCategory(visibility, clouds, verticalVisibility);
    return {
        metar: flightCategory === 'VFR' ? 'good' : flightCategory === 'MVFR' ? 'medium' : 'bad',
        taf: 'unknown',
    };
};

export function getFlightCategory(
    visibility: Visibility | undefined,
    clouds: ICloud[],
    verticalVisibility?: number,
): FlightCategory {
    const convertedVisibility = convertToMiles(visibility);
    const distance = convertedVisibility != null ? convertedVisibility : Infinity;
    const height = determineCeilingFromClouds(clouds)?.height ?? verticalVisibility ?? Infinity;

    let flightCategory = FlightCategory.VFR;

    if (height <= 3000 || distance <= 5) flightCategory = FlightCategory.MVFR;
    if (height <= 1000 || distance <= 3) flightCategory = FlightCategory.IFR;
    if (height <= 500 || distance <= 1) flightCategory = FlightCategory.LIFR;

    return flightCategory;
}
/**
 * Finds the ceiling. If no ceiling exists, returns the lowest cloud layer.
 */

export function determineCeilingFromClouds(clouds: ICloud[]): ICloud | undefined {
    let ceiling: ICloud | undefined;

    clouds.forEach((cloud) => {
        if (
            cloud.height != null &&
            cloud.height < (ceiling?.height || Infinity) &&
            (cloud.quantity === CloudQuantity.OVC || cloud.quantity === CloudQuantity.BKN)
        )
            ceiling = cloud;
    });

    return ceiling;
}
function convertToMiles(visibility?: Visibility): number | undefined {
    if (!visibility) return;

    switch (visibility.unit) {
        case DistanceUnit.StatuteMiles:
            return visibility.value;
        case DistanceUnit.Meters:
            const distance = visibility.value * 0.000621371;

            if (visibility.value % 1000 === 0 || visibility.value === 9999)
                return Math.round(distance);

            return +distance.toFixed(2);
    }
}

export enum FlightCategory {
    VFR = 'VFR',
    MVFR = 'MVFR',
    IFR = 'IFR',
    LIFR = 'LIFR',
}
