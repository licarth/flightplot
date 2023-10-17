import { pipe } from 'fp-ts/lib/function';
import * as Decoder from 'io-ts/lib/Decoder';
import { fromClassCodec } from '~/iots';

// ex:  A0135/20 NOTAMN
//      A0137/20 NOTAMR A0135/20
//      A0139/20 NOTAMC A0137/20

export class NotamIdentifier {
    notamId;
    type;
    parentNotamId;

    constructor(props: NotamIdentifierProps) {
        this.notamId = props.notamId;
        this.type = props.type;
        this.parentNotamId = props.parentNotamId;
    }

    toString() {
        return `${this.notamId} ${this.type}${this.parentNotamId ? ' ' + this.parentNotamId : ''}`;
    }

    static propsDecoder = pipe(
        {
            decode: (s: string) => {
                // split on single or multiple spaces
                const parts = s.split(/\s+/);

                if (parts.length < 2 || parts.length > 3) {
                    return Decoder.failure(s, 'a valid NOTAM identifier');
                } else if (parts.length === 2 && parts[1] !== 'NOTAMN') {
                    return Decoder.failure(s, 'a NOTAMN if no parent NOTAM is specified');
                }

                return Decoder.success({
                    notamId: parts[0],
                    type: parts[1],
                    parentNotamId: parts[2] || null,
                });
            },
        },
        Decoder.compose(
            Decoder.fromStruct({
                notamId: Decoder.string,
                type: Decoder.literal('NOTAMN', 'NOTAMR', 'NOTAMC'),
                parentNotamId: Decoder.nullable(Decoder.string),
            }),
        ),
    );

    static decoder: Decoder.Decoder<string, NotamIdentifier> = pipe(
        NotamIdentifier.propsDecoder,
        Decoder.compose(fromClassCodec(NotamIdentifier)),
    );
}

export type NotamIdentifierProps = Decoder.TypeOf<typeof NotamIdentifier.propsDecoder>;
