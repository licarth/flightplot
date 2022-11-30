import * as Decoder from 'io-ts/lib/Decoder';
import _ from 'lodash';
import type { AiracData } from 'ts-aerodata-france';
import type { Notam } from '../Notam';

type RtbaNotam = Decoder.TypeOf<typeof RtbaNotam.decoder>;
namespace RtbaNotam {
    export const decoder = (airacData: AiracData) => ({
        decode: (n: Notam) => {
            const dangerZonesByName = _.keyBy(airacData.dangerZones, ({ name }) =>
                name.replace(/ /g, ''),
            );
            if (n.q.code.codeString === 'RRCA' && n.e.match(/RTBA/g) !== null) {
                const REGEX = /ZONE (R(?:\d|[A-Z]|\.)*).*\s(\d{4}-\d{4})/g;
                let zones = [];
                let matches;
                while ((matches = REGEX.exec(n.e)) !== null) {
                    const zoneId = matches[1];
                    const times = matches[2];
                    const zone = dangerZonesByName[zoneId];
                    if (zone) {
                        // console.log(`${zoneId} => ${times}`);
                        zones.push({ zone, times });
                    } else {
                        console.log(`no zone found for ${zoneId}`);
                    }
                }

                if (zones.length > 0) {
                    return Decoder.success({ _tag: 'RtbaNotam' as 'RtbaNotam', n, zones });
                }
            }
            return Decoder.failure(n, 'an RTBA notam');
        },
    });
}

type PjeNotam = Decoder.TypeOf<typeof PjeNotam.decoder>;
namespace PjeNotam {
    export const decoder = {
        decode: (n: Notam) => {
            if (n.q.code.codeString === 'WPLW') {
                const matchingZones = /NR ?((\d|[A-Z])*)/g.exec(n.e);

                if (matchingZones && matchingZones.length > 0) {
                    return Decoder.success({
                        _tag: 'PjeNotam' as 'PjeNotam',
                        n,
                        zones: matchingZones[1],
                    });
                }
            }
            return Decoder.failure(n, 'an RTBA notam');
        },
    };
}
export const foldRichNotam =
    ({ rtba, pje }: { rtba?: (n: RtbaNotam) => any; pje?: (n: PjeNotam) => any }) =>
    (rn: RichNotam) => {
        switch (rn._tag) {
            case 'RtbaNotam':
                if (rtba) {
                    return rtba(rn);
                }
                break;

            case 'PjeNotam':
                if (pje) {
                    return pje(rn);
                }
            default:
                return null;
        }
    };

export namespace RichNotam {
    export const decoder = (airacData: AiracData) =>
        Decoder.union(PjeNotam.decoder, RtbaNotam.decoder(airacData));
    // export const decoder = Decoder.fromSum('_tag')({
    //     RtbaNotam: RtbaNotam.decoder,
    //     PjeNotam: PjeNotam.decoder,
    // });
}

export type RichNotam = Decoder.TypeOf<ReturnType<typeof RichNotam.decoder>>;
