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
                const zones = [];
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

export const ZONE_REGEXP =
    /(?:RESTRICTED )?(?:AREAS? )?(?:LF-|LF)?((?:R|CBA) ?[0-9]{1,3}[A-Z]?-?)((?: (?!ACT)[[A-Z]{0,2}[1-9]?)*)( |\n)/g;

export const INCLUDES_ACT_OR_ACTIVATED = /ACT$|ACTIVATED|ACT /g;

const forbiddenZoneSuffixes = ['LA', 'PAS']; // LF-R68LA is not a zone it's to avoid confusion with LF-R68 LA COURTINE Or LF-R68 PAS DE ...

export const degradedMatch = (notamE: string, dangerZonesByName: Set<string>) => {
    if (!INCLUDES_ACT_OR_ACTIVATED.test(notamE)) {
        return [[], []];
    }
    const MAIN_ZONE_REGEXP = /(?:LF-|LF)?((?:R|CBA) ?[0-9]{1,3})(.*)/g;
    const REST_REGEXP = /(?<![A-Z])[A-Z]{1,2}(?![A-Z])/g; // Negative lookbehind and negative lookahead to avoid matching more than 2 consecutive letters
    const mainMatch = new RegExp(MAIN_ZONE_REGEXP).exec(notamE.replace(/,/g, ' ')); // Replace commas with spaces
    console.log(mainMatch);

    if (!mainMatch || mainMatch.length < 2) {
        return [[], []];
    }

    const mainZone = noSpace(mainMatch[1]);
    const rest = mainMatch[2];

    const suffixes = rest.match(REST_REGEXP); // Replace commas with spaces

    console.log(suffixes);

    if (suffixes?.length && suffixes.length > 0) {
        const mappedZones = suffixes
            .filter((suffix) => {
                return !forbiddenZoneSuffixes.includes(suffix);
            })
            .map((z) => `${mainZone}${z}`);
        const [knownZones, unknownZones] = _.partition(mappedZones, (z) =>
            dangerZonesByName.has(z),
        );

        return [knownZones, unknownZones];
    }

    return [[], []];
};

export const matchZones = (notamE: string, dangerZonesByName: Set<string>) => {
    const matched = new RegExp(ZONE_REGEXP).exec(notamE.replace(/,/g, ' ')); // Replace commas with spaces
    console.log('matched', matched);

    if (matched && matched.length >= 1) {
        const mainZone = noSpace(matched[1]);
        const secondaryZonesSuffixes = matched[2]
            .split(' ')
            .map(noSpace)
            .filter((z) => z !== '');
        if (secondaryZonesSuffixes.length === 0 && dangerZonesByName.has(mainZone)) {
            return [[mainZone], []];
        } else {
            const mappedZones = secondaryZonesSuffixes
                .filter((suffix) => {
                    return !forbiddenZoneSuffixes.includes(suffix);
                })
                .map((z) => `${mainZone}${z}`);
            const [knownZones, unknownZones] = _.partition(mappedZones, (z) =>
                dangerZonesByName.has(z),
            );

            if (secondaryZonesSuffixes.length === 1) {
                if (dangerZonesByName.has(mappedZones[0])) {
                    return [[mappedZones[0]], []];
                } else {
                    return [[mainZone], []];
                }
            }

            if (knownZones.length > unknownZones.length / 2) {
                // Most zones are known
                return [knownZones, unknownZones];
            } else if (knownZones.length === 0) {
                if (dangerZonesByName.has(mainZone)) {
                    return [[mainZone], []];
                }
            }
            console.log('unknownZones', unknownZones, 'notamE', notamE, 'knownZones', knownZones);

            // If we still have zero zones, let's switch to the degraded mode
            if (knownZones.length === 0 && unknownZones.length === 0) {
                return degradedMatch(notamE, dangerZonesByName);
            }

            return [knownZones, []];
        }
    } else {
        return 'matching REGEX of RESTRICTED AREAS' as const;
    }
};

class NotamDecoder {
    private dangerZonesByName;
    private airacData;
    private dangerZoneNames;

    constructor(airacData: AiracData) {
        this.airacData = airacData;
        this.dangerZonesByName = _.keyBy(airacData.dangerZones, ({ name }) =>
            name.replace(/ /g, ''),
        );
        this.dangerZoneNames = new Set(Object.keys(this.dangerZonesByName));
    }

    decode(n: Notam) {
        if (n.q.code.codeString === 'RRCA') {
            const startDate = n.b.date;
            const endDate = n.c?.date;
            if (!startDate || !endDate) {
                return Decoder.failure(n, 'have valid dates');
            }
            const [knownZones, unknownZones] = matchZones(n.e, this.dangerZoneNames);

            if (unknownZones.length > 0) {
                console.warn('unknownZones', unknownZones, 'notamE', n.e, 'knownZones', knownZones);
            }
            if (knownZones.length === 0 && unknownZones.length === 0) {
                console.warn('no zones found in NOTAM', n.e);
            }

            if (typeof knownZones === 'string') {
                return Decoder.failure(n, knownZones);
            }

            if (knownZones.length === 0) {
                return Decoder.failure(n, 'a NOTAM with valid zones');
            } else {
                const notam = {
                    _tag: 'ZoneActivationNotam' as const,
                    n,
                    zones: knownZones.map((zoneName) => ({
                        zone: this.dangerZonesByName[zoneName],
                        startDate,
                        endDate,
                    })),
                };
                return Decoder.success(notam);
            }
        } else {
            return Decoder.failure(
                n.q.code.codeString,
                'a single/multiple restricted zone activation notam',
            );
        }
    }
}

namespace ZoneActivationNotam {
    export const decoder = (airacData: AiracData) => new NotamDecoder(airacData);
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
