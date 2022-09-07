import path from 'path';
import sharp from 'sharp';
import { Lambert93Coords } from './coordsConverter';

type LambertBBox = {
    bottomLeft: Lambert93Coords;
    topRight: Lambert93Coords;
};

export class OaciCropper {
    imagePath = path.resolve(__dirname, '../ign-oaci-2022.tif');

    minX = 70000;
    minY = 5_950_000;

    heightPixels = 8000 * 3;
    widthPixels = 8000 * 3;

    maxX = this.minX + this.widthPixels * 50;
    maxY = this.minY + this.heightPixels * 50;

    sharp;

    constructor() {
        this.sharp = sharp(this.imagePath, { limitInputPixels: false }).jpeg({
            quality: 50,
        });
        // .jpeg({
        //   quality: 50,
        // });
    }

    async crop(bbox: LambertBBox) {
        //TODO make sure Lambert coords are within image bounds...
        try {
            if (
                bbox.topRight.x > this.maxX ||
                bbox.topRight.y > this.maxY ||
                bbox.bottomLeft.x < this.minX ||
                bbox.bottomLeft.y < this.minY
            ) {
                return null;
            }
            return this.sharp.extract(this.imageRegionFromLambertCoords(bbox)).toBuffer();
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    imageRegionFromLambertCoords({ bottomLeft, topRight }: LambertBBox): sharp.Region {
        const factX = (this.maxX - this.minX) / this.widthPixels;
        const factY = (this.maxY - this.minY) / this.heightPixels;
        const left = Math.round((bottomLeft.x - this.minX) / factX);
        const top = this.heightPixels - Math.round((topRight.y - this.minY) / factY);
        const width = Math.round((topRight.x - bottomLeft.x) / factX);
        const height = Math.round((topRight.y - bottomLeft.y) / factY);

        return { left, top, width, height };
    }
}
