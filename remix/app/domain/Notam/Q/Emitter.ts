import type { Opaque } from '../../Opaque';

export type EmitterId = Opaque<'EmitterId', string>;

export const toEmitterId = (id: string) => id as EmitterId;

export interface EmitterProps {
    readonly id: EmitterId;
}

export class Emitter {
    readonly id: EmitterId;

    constructor(props: EmitterProps) {
        this.id = props.id;
    }

    clone({ id = this.id }: Partial<EmitterProps> = {}): Emitter {
        return new Emitter({
            id,
        });
    }
}
