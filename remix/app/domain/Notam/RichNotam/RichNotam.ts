import { addDays, parse } from 'date-fns';
import * as Decoder from 'io-ts/lib/Decoder';
import _ from 'lodash';
import type { AiracData, DangerZone } from 'ts-aerodata-france';
import type { Notam } from '../Notam';
import { parseUTCDate } from '../parseUTCDate';

namespace RtbaNotam {
    export const decoder = (airacData: AiracData) => ({
        decode: (n: Notam) => {
            const dangerZonesByName = _.keyBy(airacData.dangerZones, ({ name }) =>
                name.replace(/ /g, ''),
            );
            if (n.q.code.codeString === 'RRCA' && n.e.match(/RTBA/g) !== null) {
                const REGEX = /ZONE (R(?:\d|[A-Z]|\.)*).*\s(\d{4}-\d{4})/g;
                let zones = [];
                let matches;
                while ((matches = REGEX.exec(n.e)) !== null) {
                    const zoneId = matches[1];
                    const times = matches[2];
                    const baseDate = n.b.date;
                    if (!baseDate) {
                        return Decoder.failure(n, 'a valid start date');
                    }
                    const startNums = times.slice(0, 4);
                    const endNums = times.slice(5, 9);
                    const startDate = parseUTCDate(startNums, 'HHmm', baseDate);
                    const endDate = parseUTCDate(
                        endNums,
                        'HHmm',
                        endNums < startNums ? addDays(baseDate, 1) : baseDate,
                    );
                    const zone = dangerZonesByName[zoneId];
                    if (zone) {
                        zones.push({ zone, startDate, endDate });
                    } else {
                        console.log(`no zone found for ${zoneId}`);
                    }
                }

                if (zones.length > 0) {
                    return Decoder.success({ _tag: 'RtbaNotam' as 'RtbaNotam', n, zones });
                }
            }
            return Decoder.failure(n, 'an RTBA notam');
        },
    });
}

namespace ZoneActivationNotam {
    export const decoder = (airacData: AiracData) => ({
        decode: (n: Notam) => {
            const dangerZonesByName = _.keyBy(airacData.dangerZones, ({ name }) =>
                name.replace(/ /g, ''),
            );
            if (n.q.code.codeString === 'RRCA') {
                const startDate = n.b.date;
                const endDate = n.c?.date;
                if (!startDate || !endDate) {
                    return Decoder.failure(n, '/have valid dates');
                }
                const REGEX =
                    /(?:RESTRICTED )?(?:AREAS? )?(?:LF-|LF)((?:R|CBA) ?[0-9]{1,3}[A-Z]?-?)((?: (?!ACT)[[A-Z]{0,3}[1-9]?)*)( |\n)/g;
                const matched = new RegExp(REGEX).exec(n.e);
                const zones: { zone: DangerZone; startDate: Date; endDate: Date }[] = [];
                const addZone = (zoneName: string) => {
                    const zone = dangerZonesByName[zoneName];
                    if (!zone) {
                        console.error("couldn't find zone", zoneName);
                    } else {
                        zones.push({
                            zone,
                            startDate,
                            endDate,
                        });
                    }
                };
                if (matched && matched.length >= 1) {
                    const mainZone = noSpace(matched[1]);
                    const secondaryZones = matched[2]
                        .split(' ')
                        .map(noSpace)
                        .filter((z) => z !== '');
                    if (secondaryZones.length === 0) {
                        addZone(mainZone);
                    } else {
                        for (const zone of secondaryZones) {
                            const secondaryZone = `${mainZone}${zone}`;
                            addZone(secondaryZone);
                        }
                    }
                } else {
                    return Decoder.failure(n, 'matching REGEX of RESTRICTED AREAS');
                }
                if (zones.length === 0) {
                    return Decoder.failure(n, 'a NOTAM with valid zones');
                } else if (zones.length > 0) {
                    return Decoder.success({
                        _tag: 'ZoneActivationNotam' as 'ZoneActivationNotam',
                        n,
                        zones,
                    });
                }
            }
            return Decoder.failure(n, 'a single/multiple restricted zone activation notam');
        },
    });
}

const noSpace = (s: string) => s.replace(/ /g, '');

export type PjeNotam = Decoder.TypeOf<typeof PjeNotam.decoder>;

namespace PjeNotam {
    export const decoder = {
        decode: (n: Notam) => {
            if (n.q.code.codeString === 'WPLW') {
                const matchingZones = /NR ?((\d|[A-Z])*)/g.exec(n.e);

                if (matchingZones && matchingZones.length > 0) {
                    return Decoder.success({
                        _tag: 'PjeNotam' as 'PjeNotam',
                        n,
                        zones: matchingZones[1],
                    });
                }
            }
            return Decoder.failure(n, 'a PJE notam');
        },
    };
}

export const foldRichNotam =
    <T, U, V>({
        rtba,
        pje,
        zoneActivationNotam,
    }: {
        rtba?: (n: RtbaNotam) => T;
        pje?: (n: PjeNotam) => U;
        zoneActivationNotam?: (n: ZoneActivationNotam) => V;
    }) =>
    (rn: RichNotam) => {
        if (isPjeNotam(rn)) {
            if (pje) {
                return pje(rn);
            }
        } else if (isRtbaNotam(rn)) {
            if (rtba) {
                return rtba(rn);
            }
        } else if (isZoneActivationNotam(rn)) {
            if (zoneActivationNotam) {
                return zoneActivationNotam(rn);
            }
        }
        throw new Error('unreachable');
    };

export const isPjeNotam = (n: RichNotam): n is PjeNotam => n._tag === 'PjeNotam';
export const isRtbaNotam = (n: RichNotam): n is RtbaNotam => n._tag === 'RtbaNotam';
export const isZoneActivationNotam = (n: RichNotam): n is ZoneActivationNotam =>
    n._tag === 'ZoneActivationNotam';

export namespace RichNotam {
    export const decoder = (airacData: AiracData) =>
        Decoder.union(
            PjeNotam.decoder,
            RtbaNotam.decoder(airacData),
            ZoneActivationNotam.decoder(airacData),
        );
}

export type RtbaNotam = Decoder.TypeOf<ReturnType<typeof RtbaNotam.decoder>>;
export type ZoneActivationNotam = Decoder.TypeOf<ReturnType<typeof ZoneActivationNotam.decoder>>;
export type RichNotam = Decoder.TypeOf<ReturnType<typeof RichNotam.decoder>>;
