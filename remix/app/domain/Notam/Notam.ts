import { pipe } from 'fp-ts/lib/function';
import * as Codec from 'io-ts/lib/Codec';
import * as Decoder from 'io-ts/lib/Decoder';
import { fromClassCodec } from '~/iots';
import { NotamDate } from './NotamDate';
import { NotamIdentifier } from './NotamIdentifier';
import { Q } from './Q';

export class Notam {
    identifier;
    q;
    a;
    b;
    c;
    d?;
    e;
    f?;
    g?;

    constructor({ identifier, q, a, b, c, d, e, f, g }: Props) {
        this.identifier = identifier;
        this.q = q;
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.e = e;
        this.f = f;
        this.g = g;
    }

    static lexer = {
        decode: (originalString: string) => {
            const s = `
${originalString}
`;
            const reg =
                /(?:(Q)\)((?:(?:.|\s)(?!(?:A|B|C|D|E|F|G)\)))*))(?: |\n)?(?:(A)\)((?:(?:.|\s)(?!(?:B|C|D|E|F|G)\)))*))(?: |\n)?(?:(B)\)((?:(?:.|\s)(?!(?:C|D|E|F|G)\)))*))(?: |\n)?(?:(C)\)((?:(?:.|\s)(?!(?:D|E|F|G)\)))*))?(?: |\n)?(?:(D)\)((?:(?:.|\s)(?!(?:E|F|G)\)))*))?(?: |\n)?(?:(E)\)((?:(?:.|\s)(?!(?:F|G)\)))*))?(?: |\n)?(?:(F)\)((?:(?:.|\s)(?!(?:G)\)))*))?(?: |\n)?(?:(G)\)((?:(?:.|\s)(?!(?:G)\)))*))?/g;
            const parts = reg.exec(s);
            const [id] = s.split(reg, 1);
            const groups: { [k: string]: string } = {};
            if (!parts) {
                return Decoder.failure(s, 'Notam regexp failed');
            }
            for (let i = 1; i < parts.length; i += 2) {
                const [letter, content] = [parts[i], parts[i + 1]];
                if (letter) {
                    // console.log(letter + ') ', content);
                    groups[letter.trim().toLocaleLowerCase()] = content.trim();
                }
            }

            for (const g of ['q', 'a', 'b', 'e']) {
                if (!groups[g]) {
                    return Decoder.failure(s, `missing group ${g.toLocaleUpperCase()}`);
                }
            }

            return Decoder.success({ identifier: id.trim(), ...groups } as {
                identifier: string;
                q: string;
                a: string;
                b: string;
                c?: string;
                d?: string;
                e: string;
                f?: string;
                g?: string;
            });
        },
    };

    static propsDecoder = pipe(
        Notam.lexer,
        Decoder.compose(
            pipe(
                Decoder.fromStruct({
                    identifier: NotamIdentifier.decoder,
                    q: Q.decoder,
                    a: Decoder.string,
                    b: NotamDate.decoder,
                    e: Decoder.string,
                }),
                Decoder.intersect(
                    Decoder.fromPartial({
                        c: NotamDate.decoder,
                        d: Decoder.string,
                        f: Decoder.string,
                        g: Decoder.string,
                    }),
                ),
            ),
        ),
    );

    static decoder: Decoder.Decoder<string, Notam> = pipe(
        Notam.propsDecoder,
        Decoder.compose(fromClassCodec(Notam)),
    );
}

export type Props = Decoder.TypeOf<typeof Notam.propsDecoder>;
