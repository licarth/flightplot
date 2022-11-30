import { fold, right } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import { draw } from 'io-ts/lib/Decoder';
import { Notam } from './Notam';
import icao_notams from './notams-icao-fra-en';
import notams from './notams-notamweb-fra-fr';
import { foldRichNotam, RichNotam } from './RichNotam/RichNotam';
import * as E from 'fp-ts/lib/Either';
import { AiracData } from 'ts-aerodata-france';
import currentCycle from 'ts-aerodata-france/build/jsonData/2022-11-03.json';
import { NotamDate } from './NotamDate';
import { Code, Modifier, Q, Subject } from './Q';
import modifierTable from './Q/Code/modifierTable';
import subjectTable from './Q/Code/subjectTable';
import { frnotams } from './fr-notams';
import notamsNotamwebFraFr from './notams-notamweb-fra-fr';
import { NotamIdentifier } from './NotamIdentifier';

const fixture1 = `LFFA-R3561/21 NOTAMN 
Q) LFXX/QRTCA/ I/ BO/ W/490/550/4652N00536E307
A) LFEE LFFF LFMM 
B) 2022 Jan 13  00:00 C) 2023 Jan 11  23:59
E) TRANSIT D'UN DRONE DANS L'EST DE LA FRANCE - SUP AIP 281/21 :
OBJET : CREATION, A TITRE TEMPORAIRE, D'UNE ZONE DANGEREUSE ET DE 3 
ZONES REGLEMENTEES.
CE SUP AIP EST DISPONIBLE SUR WWW.SIA.AVIATION-CIVILE.GOUV.FR
F) FL490
G) FL550
`;

const fixture2 = `
LFFA-N149/22 NOTAMN
Q) LFXX/QRRCA/ IV/ BO/ W/0/43/4726N00011W
A) LFBB LFFF LFMM LFRR
B) 2022-11-24T16:07:00Z C) 2022-11-25T00:59:00Z
E) ZONES AIRFORCE RTBA ACT
ZONE R139 CHER
1607-0059:ACTIVE
ZONE R142 NIEVRE
1607-0059:ACTIVE
ZONE R143 AUVERGNE
1700-0059:ACTIVE
ZONE R144 LOIRE
1607-0059:ACTIVE
ZONE R145 CREUSE
1607-0059:ACTIVE
ZONE R165 VIENNE
1607-0059:ACTIVE
F) SFC
G) 4300FT AMSL
`;

const fixture3 = `
A4288/22 NOTAMN
    Q) LFRR/QFMXX/IV/BO /A /000/999/4709N00136W005
    A) LFRS B) 2209140933 C) PERM
    E) MET SERVICES MODIFIED :
    REF AIP FRANCE GEN 3.5.10, TABLE 2,'EQUIPMENTS SYSTEM AND PLACE' 
    COLUMN 3, NANTES ATLANTIQUE
    READ:
    -TEMPS PRESENT: CAPTEUR DE TEMPS PRESENT (PARC)
    -VENT: AERONAUTIQUE (MOYEN ET MAX)
    -RVR/VISIBILITE: 3 DIFFUSOMETRES THR 03 (DOUBLE), MEDIAN,ET THR 21 
    -NUAGES: 1 TNL APPROCHE 03 ET 1 TNL SEUIL 21 
    -S.A AVEC DIFFUSION A LA TWR
    CREATED: 14 Sep 2022 09:34:00 
    SOURCE: EUECYIYN
`;

describe('Notam', () => {
    describe('lexer', () => {
        it('should lex properly', () => {
            expect(Notam.lexer.decode(fixture1)).toEqual(
                right({
                    identifier: 'LFFA-R3561/21 NOTAMN',
                    q: 'LFXX/QRTCA/ I/ BO/ W/490/550/4652N00536E307',
                    a: 'LFEE LFFF LFMM',
                    b: '2022 Jan 13  00:00',
                    c: '2023 Jan 11  23:59',
                    e: `TRANSIT D'UN DRONE DANS L'EST DE LA FRANCE - SUP AIP 281/21 :
OBJET : CREATION, A TITRE TEMPORAIRE, D'UNE ZONE DANGEREUSE ET DE 3 
ZONES REGLEMENTEES.
CE SUP AIP EST DISPONIBLE SUR WWW.SIA.AVIATION-CIVILE.GOUV.FR`,
                    f: 'FL490',
                    g: 'FL550',
                }),
            );
        });
    });
    describe('decoder', () => {
        it('fixture1', () => {
            expect(Notam.decoder.decode(fixture1)).toEqual(
                right(
                    new Notam({
                        identifier: new NotamIdentifier({
                            notamId: 'LFFA-R3561/21',
                            type: 'NOTAMN',
                            parentNotamId: null,
                        }),
                        a: 'LFEE LFFF LFMM',
                        b: new NotamDate({
                            s: '2022 Jan 13  00:00',
                            date: new Date('2022-01-13T00:00:00.000Z'),
                            est: false,
                        }),
                        c: new NotamDate({
                            s: '2023 Jan 11  23:59',
                            date: new Date('2023-01-11T23:59:00.000Z'),
                            est: false,
                        }),
                        e: `TRANSIT D'UN DRONE DANS L'EST DE LA FRANCE - SUP AIP 281/21 :
OBJET : CREATION, A TITRE TEMPORAIRE, D'UNE ZONE DANGEREUSE ET DE 3 
ZONES REGLEMENTEES.
CE SUP AIP EST DISPONIBLE SUR WWW.SIA.AVIATION-CIVILE.GOUV.FR`,
                        f: 'FL490',
                        g: 'FL550',
                        q: new Q({
                            code: new Code({
                                modifier: new Modifier({ ...modifierTable.CA, code: 'CA' }),
                                subject: new Subject({ ...subjectTable.RT, code: 'RT' }),
                            }),
                            target: 'LFXX',
                            traffic: { categories: ['I'] },
                        }),
                    }),
                ),
            );
        });
        it.skip('fixture2', () => {
            expect(
                pipe(
                    Notam.decoder.decode(fixture2),
                    E.foldW(draw, (a) => a),
                ),
            ).toEqual({});
        });
        it('fixture3', () => {
            expect(
                E.isRight(
                    pipe(
                        Notam.decoder.decode(fixture3),
                        E.mapLeft((e) => {
                            console.error(draw(e));
                            return e;
                        }),
                        // E.foldW(draw, (a) => a),
                    ),
                ),
            ).toEqual(true);
        });
    });
    describe('examples', () => {
        it('NOTAMWEB-FR', () => {
            const SEP = '\nLFFA';
            notamsNotamwebFraFr
                .split(SEP)
                .map((s) => SEP + s)
                .map((s) => ({ s, d: Notam.decoder.decode(s) }))
                .map(({ s, d }) =>
                    pipe(
                        d,
                        fold(
                            (e) => {
                                console.error(draw(e));
                            },
                            (n) => {
                                // console.log(
                                //     `${
                                //         n.identifier
                                //     }\nDescription: ${n.q?.code.subject.toString()}: ${n.q?.code.modifier.toString()}\n${
                                //         n.q?.target
                                //     }\n${n.e}\n${n.b.toString()} => ${n.c}\n${n.d}`,
                                // );
                            },
                        ),
                    ),
                );
        });
        it('FRENCH-METARS', () => {
            const SEP = '\n\n';
            frnotams
                .split(SEP)
                .map((s) => SEP + s)
                .map((s) => ({ s, d: Notam.decoder.decode(s) }))
                .map(({ s, d }) =>
                    pipe(
                        d,
                        fold(
                            (e) => {
                                console.error(draw(e));
                            },
                            (n) => {
                                // console.log(
                                //     `${
                                //         n.identifier
                                //     }\nDescription: ${n.q?.code.subject.toString()}: ${n.q?.code.modifier.toString()}\n${
                                //         n.q?.target
                                //     }\n${n.e}\n${n.b.toString()} => ${n.c}\n${n.d}`,
                                // );
                            },
                        ),
                    ),
                );
        });
        it('ICAO', () => {
            icao_notams
                .map((s) => ({ s, d: Notam.decoder.decode(s.all) }))
                .map(({ s, d }) =>
                    pipe(
                        d,
                        fold(
                            (e) => {
                                console.error(draw(e));
                                console.log(s.all);
                            },
                            function (n) {
                                // return console.log(
                                //     `${n.identifier}\nDescription: ${n.q?.code.subject.description}: ${n.q?.code.modifier.description}\n${n.q?.target}\n${n.e}\n${n.b} => ${n.c}\n${n.d}`
                                // );
                            },
                        ),
                    ),
                );
        });
        it('ICAO PJE', () => {
            icao_notams
                .map((s) => ({
                    s,
                    n: pipe(
                        Notam.decoder.decode(s.all),
                        fold(
                            (e) => {
                                // console.error(draw(e));
                                return null;
                            },
                            (n) => n,
                        ),
                    ),
                }))
                .filter(({ s, n }) => n !== null)
                .filter(({ n }) => n?.q.code.subject.code === 'WP')
                // .filter(({ s }) => s.all.match(/NR ?(\d|[A-Z])*/g))
                // .filter(({ n }) => n?.q.code.codeString === 'RRCA')
                .map(function ({ s, n }) {
                    // return console.log(
                    //     `${n?.q.code.toString()}\n${s.all}\n${n?.b.toString()} => ${n?.c}\n${n?.d}`
                    // );
                });
        });
        it('ICAO PJE', async () => {
            const allNotams: Notam[] = [];

            const airacData = await AiracData.loadCycle(currentCycle);

            // // To display them on the map
            // allNotams.map((n) =>
            //     foldRichNotam({
            //         rtbaNotam: (n: RtbaNotam) => {
            //             // display them...
            //         },
            //     })(n),
            // );
            icao_notams.map((s) => ({
                s,
                n: pipe(
                    s.all,
                    Notam.decoder.decode,
                    E.chain(RichNotam.decoder(airacData).decode),
                    E.map(
                        foldRichNotam({
                            pje: ({ zones }) => {
                                // console.log(zones);
                            },
                            rtba: ({ zones }) => {
                                // console.log(zones);
                            },
                        }),
                    ),
                ),
            }));
        });
    });
});
