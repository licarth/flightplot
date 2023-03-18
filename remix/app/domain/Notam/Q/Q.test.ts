import { foldW, right } from 'fp-ts/lib/Either';
import { Q } from './Q';
import * as Codec from 'io-ts/lib/Codec.js';
import * as Decoder from 'io-ts/lib/Decoder.js';
import { pipe } from 'fp-ts/lib/function';

describe('Q', () => {
    describe.only('', () => {
        it('', () => {
            const t = pipe(
                Codec.string.decode('Hello'),
                foldW(
                    (e) => e,
                    (a) => a,
                ),
            );
        });
    });

    describe('lexer', () => {
        it('1', () => {
            expect(Q.lexer.decode('LFFF/QFAXX/IV/NBO/ A/000/999/4843N00223E005')).toEqual(
                right({
                    code: 'FAXX',
                    target: 'LFFF',
                    traffic: 'IV',
                    nbom: 'NBO',
                    aew: 'A',
                    lowerLimit: '000',
                    higherLimit: '999',
                    geoloc: '4843N00223E005',
                }),
            );
        });
        it('2', () => {
            expect(Q.lexer.decode('LFXX/QRTCA/ I/ BO/ W/490/550/4652N00536E307')).toEqual(
                right({
                    code: 'RTCA',
                    target: 'LFXX',
                    traffic: 'I',
                    nbom: 'BO',
                    aew: 'W',
                    lowerLimit: '490',
                    higherLimit: '550',
                    geoloc: '4652N00536E307',
                }),
            );
        });
    });
});
