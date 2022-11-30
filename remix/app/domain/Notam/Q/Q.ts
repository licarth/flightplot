import { pipe } from 'fp-ts/lib/function';
import * as Decoder from 'io-ts/lib/Decoder';
import { fromClassCodec } from '~/iots';
import { Code } from './Code';
import { Traffic } from './Traffic';

// ex: LFFF/QFAXX/IV/NBO/ A/000/999/4843N00223E005
// ex: LFXX/QRTCA/ I/ BO/ W/490/550/4652N00536E307

export interface QProps {
    target: string;
    code: Code;
    traffic: Traffic;
}

export class Q {
    target;
    code;
    traffic;

    constructor(props: QProps) {
        this.target = props.target;
        this.code = props.code;
        this.traffic = props.traffic;
    }

    static lexer = {
        decode: (s: string) => {
            const errors: string[] = [];
            const parts = s.split('/');
            if (parts.length < 8) {
                return Decoder.failure(s, 'a valid qualifier Q');
            }
            const target = parts[0].trim();
            const codeWithQ = parts[1].trim();
            if (!codeWithQ?.startsWith('Q')) {
                errors.push(`code '${codeWithQ}' does not start with 'Q'`);
            }
            const code = codeWithQ?.substring(1);
            const traffic = parts[2].trim();
            const nbom = parts[3].trim();
            const aew = parts[4].trim();
            const lowerLimit = parts[5].trim();
            const higherLimit = parts[6].trim();
            const geoloc = parts[7].trim();

            return Decoder.success({
                target,
                code,
                traffic,
                nbom,
                aew,
                lowerLimit,
                higherLimit,
                geoloc,
            });
        },
    };

    static decoder: Decoder.Decoder<string, Q> = pipe(
        Q.lexer,
        Decoder.compose(
            Decoder.fromStruct({
                code: Code.decoder,
                target: Decoder.string,
                traffic: Traffic.decoder,
            }),
        ),
        Decoder.compose(fromClassCodec(Q)),
    );
}
