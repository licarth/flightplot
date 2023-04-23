import { pipe } from 'fp-ts/lib/function';
import * as Codec from 'io-ts/lib/Codec.js';
import type { CodecType } from '~/iots';
import { taggedVersionedClassCodec } from '~/iots';
import { PrintArea } from '../PrintArea';
import { UUID, uuidCodec } from '../Uuid';
import { Wpt } from './Wpt';

export class Route {
    _tag = 'Route' as const;
    _version = 1 as const;
    _props;

    waypoints;
    id;
    title;
    printAreas;
    lastChangeAt;

    constructor(props: RouteProps) {
        this._props = props;
        this.waypoints = props.waypoints;
        this.id = props.id;
        this.title = props.title;
        this.printAreas = props.printAreas;
        this.lastChangeAt = props.lastChangeAt;
    }

    static propsCodec = (codecType: CodecType) =>
        pipe(
            Codec.struct({
                waypoints: Codec.array(Wpt.codec(codecType)), // TODO Implement Wpt codec
                id: uuidCodec,
                title: Codec.nullable(Codec.string),
            }),
            Codec.intersect(
                Codec.partial({
                    printAreas: Codec.array(PrintArea.codec),
                    lastChangeAt: Codec.number, // Maybe todo use UtcDate codec
                }),
            ),
        );

    static codec = (codecType: CodecType) =>
        taggedVersionedClassCodec(this.propsCodec(codecType), this);

    static factory = ({
        lastChangeAt = new Date().getTime(),
        waypoints = [],
        id = UUID.generatev4(),
        title = 'Route Title',
        printAreas = [],
    }: Partial<RouteProps> = {}) =>
        new Route({
            lastChangeAt,
            waypoints,
            id,
            title,
            printAreas,
        });
}

export type RouteProps = Codec.TypeOf<ReturnType<typeof Route.propsCodec>>;
