import * as Eq from 'fp-ts/lib/Eq';

export type Opaque<K extends string, T> = T & { __TYPE__: K };

export const opaqueEq: <A, T extends Opaque<any, A>>(eq: Eq.Eq<A>) => Eq.Eq<T> = (eq) =>
    Eq.fromEquals(eq.equals);
