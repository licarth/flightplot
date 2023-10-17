import { failure, success } from 'io-ts/lib/Decoder';
import modifierTable from './modifierTable';
import * as Decoder from 'io-ts/lib/Decoder';
import { pipe } from 'fp-ts/lib/function';
import { fromClassCodec } from '~/iots';

type ModifierKey = keyof typeof modifierTable;

export interface ModifierProps {
    code: ModifierKey;
    description: string;
    shortPhraseo: string;
}

export class Modifier {
    code;
    description;
    shortPhraseo;

    toString() {
        return this.description;
    }

    constructor(props: ModifierProps) {
        this.code = props.code;
        this.description = props.description;
        this.shortPhraseo = props.shortPhraseo;
    }

    static decoder: Decoder.Decoder<string, Modifier> = pipe(
        {
            decode: (s: string) => {
                if (!isModifierKey(s)) {
                    return failure(s, `does not contain a valid modifier code: ${s}.`);
                }
                return success({ code: s, ...modifierTable[s] });
            },
        },
        Decoder.compose(fromClassCodec(Modifier)),
    );
}

const isModifierKey = (s: string): s is ModifierKey => Object.keys(modifierTable).includes(s);
