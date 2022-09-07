import * as Codec from "io-ts/lib/Codec";
import { latLngCodec } from "../LatLng";
import { PageFormat } from "./PageFormat";

export namespace PrintArea {
  export const codec = Codec.struct({
    bottomLeft: latLngCodec,
    pageFormat: PageFormat.codec,
  });
}
export type PrintArea = Codec.TypeOf<typeof PrintArea.codec>;
