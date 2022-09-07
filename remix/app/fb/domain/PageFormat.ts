import * as Codec from "io-ts/lib/Codec";

export namespace PageFormat {
  export const codec = Codec.struct({
    dxMillimeters: Codec.number,
    dyMillimeters: Codec.number,
  });
}
export type PageFormat = Codec.TypeOf<typeof PageFormat.codec>;
