import * as Decoder from 'io-ts/lib/Decoder';
import { pipe } from 'fp-ts/lib/function';

import { format, isValid, parseISO } from 'date-fns';
import { fromClassCodec } from '~/iots';
import { parseUTCDate } from './parseUTCDate';

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

    static fromDDMMyy(ddMMYY: string) {
        const date = parseUTCDate(ddMMYY, 'ddMMyy');
        return new NotamDate({
            s: format(date, 'dd MMM yyyy HH:mm'),
            date,
            est: false,
        });
    }

    isPERM() {
        return this.s === 'PERM';
    }

    toString() {
        return this.isPERM() ? 'Permanent' : format(this.date!, 'dd MMM yyyy HH:mm');
    }

    isBeforeOrOnSameDay(yyyyMMdd: string) {
        if (!this.date) {
            throw new Error('NotamDate is null or PERM, cannot be before or on same day');
        }
        return format(this.date, 'yyyyMMdd') <= yyyyMMdd;
    }

    isAfterOrOnSameDay(yyyyMMdd: string) {
        if (!this.date) {
            return true;
        } else {
            return format(this.date, 'yyyyMMdd') >= yyyyMMdd;
        }
    }

    static propsDecoder = pipe({
        decode: (s: string) => {
            if (s === 'PERM') {
                return Decoder.success({ s, date: null, est: false });
            } else if (s.match(/[0-9]{10}\s?(EST)?/g)) {
                const parts = s.split(/\s+/);
                const date = parseUTCDate(parts[0], 'yyMMddHHmm');
                if (isValid(date)) {
                    return Decoder.success({ s, date, est: parts[0] === 'EST' });
                }
            } else {
                const date = parseUTCDate(s, 'yyyy MMM dd HH:mm');
                if (isValid(date)) {
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
