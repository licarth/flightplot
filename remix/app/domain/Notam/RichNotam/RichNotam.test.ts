import { AiracData } from 'ts-aerodata-france';
import { foldRichNotam, matchZones, RichNotam, ZONE_REGEXP } from './RichNotam';
import currentCycle from 'ts-aerodata-france/build/jsonData/2023-02-23.json';
import { Notam } from '../Notam';
import { pipe } from 'fp-ts/lib/function';
import * as Either from 'fp-ts/lib/Either';
import { draw } from 'io-ts/lib/Decoder';

// Currently detects the following patterns :
// RESTRICTED AREA LF-R6D 'MAILLY' ACTIVATED
// RESTRICTED AREAS LF-R68 A B C ACTIVATED.
// RESTRICTED AREA LFR251W
// RESTRICTED AREA LFR251W SAINT-ASTIER
// RESTRICTED AREA LF-R 138 TB

// Zones not in Airac data: CB zones (Cross-border zones)
// AREA LF-CBA16 ACTIVE
// AREA LF-CBA16B ACTIVE

describe('ZONE_REGEXP', () => {
    const examples: {
        notamE: string;
        avail: string[];
        expected: [string[], string[]] | [string[]];
    }[] = [
        {
            notamE: 'AREA LF-CBA16 ACTIVE',
            avail: ['CBA16'],
            expected: [['CBA16'], []],
        },
        {
            notamE: 'RESTRICTED AREAS LF-R68 A B C ACTIVATED',
            avail: ['R68', 'R68A', 'R68B', 'R68C'],
            expected: [['R68A', 'R68B', 'R68C'], []],
        },
        {
            notamE: 'RESTRICTED AREA LF-R6D "MAILLY" ACTIVATED',
            avail: ['R6D'],
            expected: [['R6D'], []],
        },
        {
            notamE: 'RESTRICTED AREA LF-R6D "MAILLY" ACT',
            avail: ['R6D'],
            expected: [['R6D'], []],
        },
        {
            notamE: 'LF-R203C LA COURTINE ACT',
            avail: ['R203', 'R203C'],
            expected: [['R203C'], []],
        },
        {
            notamE: 'RESTRICTED AREA LFR48 PAS DE LA FOSSE ACTIVATED.',
            avail: ['R48'],
            expected: [['R48'], []],
        },
        {
            notamE: 'RESTRICTED AREA LFR102 LA BRACONNE AREA ACTIVATED',
            avail: ['R102'],
            expected: [['R102'], []],
        },
        {
            notamE: 'R 111 A LA BRACONNE AREA ACTIVATED', // Case imagined by @licarth
            avail: ['R111'],
            expected: [['R111'], []],
        },
        {
            notamE: 'R111 A LA BRACONNE AREA ACTIVATED', // Case imagined by @licarth
            avail: ['R111'],
            expected: [['R111'], []],
        },
        {
            notamE: 'R111 A B C LA BRACONNE AREA ACTIVATED', // Case imagined by @licarth
            avail: ['R111A', 'R111B', 'R111C'],
            expected: [['R111A', 'R111B', 'R111C'], []],
        },
        {
            notamE: 'ZONE LF-R 203 C, LA COURTINE ACTIVATED.',
            avail: ['R203C'],
            expected: [['R203C'], []],
        },
        {
            notamE: 'ZONE LF-R 203 C, LA COURTINE ACTIVATED.',
            avail: ['R203', 'R203C'],
            expected: [['R203C'], []],
        },
        {
            notamE: 'ZONE LF-R 203 C LA COURTINE ACTIVATED.',
            avail: ['R203C'],
            expected: [['R203C'], []],
        },
        {
            notamE: 'ZONE LF-R 203 C LA COURTINE ACTIVATED.',
            avail: ['R203', 'R203C'],
            expected: [['R203C'], []],
        },
        {
            notamE: 'R203C LA COURTINE ACT',
            avail: ['R203C'],
            expected: [['R203C'], []],
        },
        // Below are tests for suspicious unknown zones
        {
            notamE: 'R111 A B C LA BRACONNE AREA ACTIVATED', // Case imagined by @licarth
            avail: ['R111A', 'R111C'],
            expected: [['R111A', 'R111C'], ['R111B']],
        },
        {
            notamE: "ORION 2023 PHASE O4 EXERCISE ACTIVATION OF LF-R 213 'NORD-EST' PART A : SEE AERODROME(S) ACCESS RESTRICTIONS AND ACTIVITIES SUSPENSION IN FRENCH AIP FRANCE ENR 5.1-507, 5.1-508 AND 5.1-510",
            avail: ['R213A', 'R213B', 'R213C'],
            expected: [[], []],
        },
        {
            notamE: 'LF-CBA16B ACTIVATED',
            avail: [],
            expected: [[], ['CBA16B']],
        },
        {
            notamE: "DUE TO WILDBOAR MILITARY EXERCISE 2023: RESTRICTED AREA LF-R 213 'NORD-EST', A B AND C PARTS ACTIVATED.",
            avail: ['R213A', 'R213B', 'R213C'],
            expected: [['R213A', 'R213B', 'R213C'], []],
        },
        // {
        //     notamE: 'R111 R112 ACTIVATED', // Case imagined by @licarth
        //     avail: ['R111', 'R112'],
        //     expected: [['R111', 'R112' ],]
        // },
        // {
        //     notamE: '',
        //     avail: [],
        //     expected: [, ],
        // },
        // {
        //     notamE: '',
        //     avail: [],
        //     expected: [, ],
        // },
    ];

    it.each(examples)('$notamE', ({ notamE, avail, expected }) => {
        expect(matchZones(notamE, new Set(avail))).toEqual(expected);
    });
});

describe('RichNotam', () => {
    it('should decode an RTBA notam', () => {});
    it('should decode a PJE notam', () => {});
    it('should decode an area activation NOTAM', async () => {
        const airacData = await AiracData.loadCycle(currentCycle);
        const notam = `
        R3395/22 NOTAMN 
        Q) LFBB/QRRCA/ IV/ BO/ W/0/195/4508N00110W
        A) LFBB
        B) 2022-12-12T13:00:00Z
        C) 2022-12-14T10:30:00Z
        E) RESTRICTED AREA LF-R290 'CARCANS' ACTIVATED.
        F) GND
        G) FL195
        
`;
        const richNotam = pipe(
            notam,
            Notam.decoder.decode,
            Either.chain(RichNotam.decoder(airacData).decode),
            Either.mapLeft((e) => {
                console.log(draw(e));
                return e;
            }),
        );

        expect(Either.isRight(richNotam)).toBe(true);
        const zones = pipe(
            richNotam,
            Either.map(
                foldRichNotam({
                    rtba: (rtba) => {
                        return rtba.zones;
                    },
                    pje: (pje) => {
                        return null;
                    },
                    zoneActivationNotam: (zoneActivationNotam) => {
                        return zoneActivationNotam.zones;
                    },
                }),
            ),
            Either.getOrElseW(() => null),
        );
        expect(zones?.length).toBe(1);
        expect(zones?.map((z) => z.zone.name)).toEqual(['R 290']);
    });
    it('should decode a multiple areas activation NOTAM', async () => {
        const airacData = await AiracData.loadCycle(currentCycle);
        const notam = `
R3365/22 NOTAMN
Q) LFXX/QRRCA/ IV/ BO/ W/42/195/4531N00214E
A) LFBB LFMM
B) 2022-12-02T08:30:00Z
C) 2022-12-02T11:30:00Z
E) RESTRICTED AREAS LF-R68 A B C ACTIVATED.
F) 4200FT AMSL
G) FL195        
`;
        const richNotam = pipe(
            notam,
            Notam.decoder.decode,
            Either.chain(RichNotam.decoder(airacData).decode),
            Either.mapLeft((e) => {
                console.log(draw(e));
                return e;
            }),
        );

        expect(Either.isRight(richNotam)).toBe(true);
        const zones = pipe(
            richNotam,
            Either.map(
                foldRichNotam({
                    rtba: (rtba) => {
                        return rtba.zones;
                    },
                    pje: (pje) => {
                        return null;
                    },
                    zoneActivationNotam: (zoneActivationNotam) => {
                        return zoneActivationNotam.zones;
                    },
                }),
            ),
            Either.getOrElseW(() => null),
        );
        expect(zones?.length).toBe(3);
        expect(zones?.map((z) => z.zone.name)).toEqual(['R 68 A', 'R 68 B', 'R 68 C']);
    });
    it('should decode a single area activation NOTAM', async () => {
        const airacData = await AiracData.loadCycle(currentCycle);
        const notam = `
        R3336/22 NOTAMN
        Q) LFFF/QRRCA/ IV/ BO/ W/20/145/4835N00421E
        A) LFFF
        B) 2022-12-05T06:00:00Z 
        C) 2022-12-08T22:30:00Z
        E) RESTRICTED AREA LF-R6D 'MAILLY' ACTIVATED
        F) 2000FT AGL
        G) FL145
`;
        const richNotam = pipe(
            notam,
            Notam.decoder.decode,
            Either.chain(RichNotam.decoder(airacData).decode),
            Either.mapLeft((e) => {
                console.log(draw(e));
                return e;
            }),
        );

        expect(Either.isRight(richNotam)).toBe(true);
        const zones = pipe(
            richNotam,
            Either.map(
                foldRichNotam({
                    rtba: (rtba) => {
                        return rtba.zones;
                    },
                    pje: (pje) => {
                        return null;
                    },
                    zoneActivationNotam: (zoneActivationNotam) => {
                        return zoneActivationNotam.zones;
                    },
                }),
            ),
            Either.getOrElseW(() => null),
        );
        expect(zones?.map((z) => z.zone.name)).toEqual(['R 6 D']);
    });
});
