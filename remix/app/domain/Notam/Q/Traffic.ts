import { pipe } from 'fp-ts/lib/function';
import * as Decoder from 'io-ts/lib/Decoder';
import { TrafficOption } from './TrafficOption';

export interface TrafficProps {
    categories: TrafficOption[];
}

export class Traffic {
    categories;

    constructor(props: TrafficProps) {
        this.categories = props.categories;
    }

    static decoder: Decoder.Decoder<string, Traffic> = pipe(
        { decode: (s: string) => Decoder.success({ categories: s.split('') }) },
        Decoder.compose(
            Decoder.fromStruct({
                categories: Decoder.array(TrafficOption.codec),
            }),
        ),
    );
}