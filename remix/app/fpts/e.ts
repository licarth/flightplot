import * as A from 'fp-ts/lib/Array.js';
import * as E from 'fp-ts/lib/Either.js';
import type { Either } from 'fp-ts/lib/Either.js';
import { foldW } from 'fp-ts/lib/Either.js';
import { pipe } from 'fp-ts/lib/function.js';

export namespace e {
    export const unsafeGetOrThrow = <T>(either: Either<unknown, T>): T => {
        return pipe(
            either,
            foldW(
                (error) => {
                    throw error;
                },
                (value) => value,
            ),
        );
    };

    export const leftSideEffect = <E>(sideEffect: (e: E) => any) =>
        E.mapLeft((e: E) => {
            sideEffect(e);
            return e;
        });

    export const split = <E, A>(arrayOfE: Array<E.Either<E, A>>) => {
        return pipe(arrayOfE, mergeFn);
    };

    export const sideEffect = <T>(sideEffect: (o: T) => void) =>
        E.chainFirstW((o: T) => {
            sideEffect(o);
            return E.of(void 0);
        });
}

const mergeFn = <E, A>(eithers: E.Either<E, A>[]) => {
    return pipe(eithers, (eithers) => {
        const separated = A.separate(eithers);
        return { errors: separated.left, successes: separated.right };
    });
};
