import { AiracData } from 'ts-aerodata-france';
import { foldRichNotam, RichNotam } from './RichNotam';
import currentCycle from 'ts-aerodata-france/build/jsonData/2022-12-01.json';
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
