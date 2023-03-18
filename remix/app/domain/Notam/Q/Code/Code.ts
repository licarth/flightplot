import { pipe } from 'fp-ts/lib/function';
import * as Decoder from 'io-ts/lib/Decoder';
import { fromClassCodec } from '~/iots';
import { Modifier } from './Modifier';
import { Subject } from './Subject';
import type * as Encoder from 'io-ts/lib/Encoder';
export class Code {
    subject;
    modifier;

    constructor(props: CodeProps) {
        this.subject = props.subject;
        this.modifier = props.modifier;
    }

    get codeString() {
        return `${this.subject.code}${this.modifier.code}`;
    }

    static encoder: Encoder.Encoder<string, Code> = {
        encode: (code) => `Q${code.codeString}`,
    };

    static propsDecoder = pipe(
        {
            decode: (s: string) => {
                if (s.length !== 4) {
                    return Decoder.failure(s, 'a valid NOTAM code');
                }
                const subject = s.substring(0, 2);
                const modifier = s.substring(2, 4);
                return Decoder.success({
                    subject,
                    modifier,
                });
            },
        },
        Decoder.compose(
            Decoder.fromStruct({
                subject: Subject.decoder,
                modifier: Modifier.decoder,
            }),
        ),
    );

    static decoder: Decoder.Decoder<string, Code> = pipe(
        Code.propsDecoder,
        Decoder.compose(fromClassCodec(Code)),
    );
}

export type CodeProps = Decoder.TypeOf<typeof Code.propsDecoder>;
