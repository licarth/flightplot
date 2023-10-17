import * as Codec from 'io-ts/lib/Codec';

export namespace TrafficOption {
    export const codec = Codec.literal('I', 'V', 'K');
}
export type TrafficOption = Codec.TypeOf<typeof TrafficOption.codec>;
