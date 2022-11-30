import * as Decoder from 'io-ts/lib/Decoder';
import { pipe } from 'fp-ts/lib/function';

import parse from 'date-fns/parse';
import { format, isValid, parseISO } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';
import { fromClassCodec } from '~/iots';

// 2205130747
// Or FR NOTAM FORMAT
// PERM for C
// 2205130747EST possible
// UTC

export class NotamDate {
    s;
    date;
    est;

    constructor(props: BProps) {
        this.s = props.s;
        this.date = props.date;
        this.est = props.est;
    }

    isPERM() {
        return this.s === 'PERM';
    }

    toString() {
        return this.isPERM() ? 'Permanent' : format(this.date!, 'dd MMM yyyy HH:mm');
    }

    static propsDecoder = pipe({
        decode: (s: string) => {
            if (s === 'PERM') {
                return Decoder.success({ s, date: null, est: false });
            } else if (s.match(/[0-9]{10}\s?(EST)?/g)) {
                const parts = s.split(/\s+/);
                const parsedDate = parse(parts[0], 'yyMMddHHmm', new Date());
                const date = zonedTimeToUtc(parsedDate, 'UTC');
                if (isValid(date)) {
                    return Decoder.success({ s, date, est: parts[0] === 'EST' });
                }
            } else {
                const parsedDate = parse(s.replace(/\s+/g, ' '), 'yyyy MMM dd HH:mm', new Date());
                const date = zonedTimeToUtc(parsedDate, 'UTC');
                if (isValid(parsedDate)) {
                    return Decoder.success({ s, date, est: false });
                } else {
                    const isoDate = parseISO(s);
                    if (isValid(isoDate)) {
                        return Decoder.success({ s, date: isoDate, est: false });
                    }
                }
            }
            return Decoder.failure(s, 'a valid METAR date or PERM');
        },
    });

    static decoder = pipe(NotamDate.propsDecoder, Decoder.compose(fromClassCodec(NotamDate)));
}

export type BProps = Decoder.TypeOf<typeof NotamDate.propsDecoder>;
