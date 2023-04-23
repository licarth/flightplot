import { right } from 'fp-ts/lib/Either';
import { AltHeightFl, AltitudeInFeet } from './AltHeightFl';

describe('Al', () => {
    it('should encode some altitude value in feet properly', async () => {
        const result = AltHeightFl.codec('string').encode(AltitudeInFeet.of(1000));
        expect(result).toEqual({ _tag: 'AltitudeInFeet', _version: 1, altitudeInFeet: 1000 });
    });
    it('should decode some altitude value in feet properly', async () => {
        const result = AltHeightFl.codec('string').decode({
            _tag: 'AltitudeInFeet',
            _version: 1,
            altitudeInFeet: 1000,
        });
        expect(result).toMatchObject(right(AltitudeInFeet.of(1000))); // _props are not exactly the same
    });
});
