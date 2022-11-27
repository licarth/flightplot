import { foldW } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import { draw } from 'io-ts/lib/Decoder';
import type { AiracData } from 'ts-aerodata-france';
import { Route } from '~/domain';

export const importRoute = (airacData: AiracData, routeJSON: object): Route => {
    return pipe(
        Route.codec(airacData).decode(routeJSON),
        foldW(
            (e) => {
                console.log(draw(e));
                return Route.empty();
            },
            (r) => {
                return r;
            },
        ),
    );
};
