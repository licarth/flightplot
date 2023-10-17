import { failure, success } from 'io-ts/lib/Decoder';
import subjectTable from './subjectTable';
import * as Decoder from 'io-ts/lib/Decoder';
import { fromClassCodec } from '~/iots';
import { pipe } from 'fp-ts/lib/function';
type SubjectKey = keyof typeof subjectTable;

export interface SubjectProps {
    code: string;
    description: string;
    shortPhraseo: string;
}

export class Subject {
    code;
    description;
    shortPhraseo;

    toString() {
        return this.description;
    }

    constructor(props: SubjectProps) {
        this.code = props.code;
        this.description = props.description;
        this.shortPhraseo = props.shortPhraseo;
    }

    static decoder: Decoder.Decoder<string, Subject> = pipe(
        {
            decode: (s: string) => {
                if (!isSubjectKey(s)) {
                    return failure(s, `code does not contain a valid subject part: ${s}.`);
                }
                return success({ code: s, ...subjectTable[s] });
            },
        },
        Decoder.compose(fromClassCodec(Subject)),
    );
}

const isSubjectKey = (s: string): s is SubjectKey => Object.keys(subjectTable).includes(s);
