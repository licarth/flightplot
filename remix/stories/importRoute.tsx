import { foldW } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import { draw } from 'io-ts/lib/Decoder';
import type { AiracData } from 'ts-aerodata-france';
import { OldRoute } from '~/domain';

export const importRoute = (airacData: AiracData, routeJSON: object): OldRoute => {
    return pipe(
        OldRoute.codec(airacData).decode(routeJSON),
        foldW(
            (e) => {
                console.log(draw(e));
                return OldRoute.empty();
            },
            (r) => {
                return r;
            },
        ),
    );
};
