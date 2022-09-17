import * as fs from 'fs';
import _ from 'lodash';
import * as path from 'path';
import sharp from 'sharp';

const directoryPath =
    '/Users/thomas/Downloads/SCANOACI_1-0__TIFF_LAMB93_FXX_2022-03-01/SCOACI/1_DONNEES_LIVRAISON_2022/SCOACI_TIF_LAMB93_FXX';

const LAMBERT_PER_PIXEL = 50;

const files = fs.readdirSync(directoryPath);

const fileNames = _.uniq(files.map((s) => s.split('.')[0]));
const regex = /\((.*)\) \((.*)\)/g;

const getFileCorners = (tabContents: string) => {
    let matches;
    const lambertToPixels = [];
    while ((matches = regex.exec(tabContents))) {
        const [x, y] = matches[1].split(',').map(Number);
        const [px, py] = matches[2].split(',').map(Number);

        lambertToPixels.push({ lambert: { x, y }, pixels: { px, py } });
    }
    return lambertToPixels;
};

const fileNamesWithBbox = fileNames.map((f) => {
    const tabContents = fs.readFileSync(path.resolve(directoryPath, f + '.tab'), {
        encoding: 'utf-8',
    });

    const corners = getFileCorners(tabContents);

    const bbox = getBbox(corners);

    console.log(bbox);

    return { fileName: path.resolve(directoryPath, f + '.tif'), bbox };
});

console.log(fileNamesWithBbox);

function getBbox(
    corners: {
        lambert: { x: number; y: number };
        pixels: { px: number; py: number };
    }[],
) {
    const minX = _.min(corners.map((c) => c.lambert.x)) || 0;
    const minY = _.min(corners.map((c) => c.lambert.y)) || 0;
    const maxX = _.max(corners.map((c) => c.lambert.x)) || 0;
    const maxY = _.max(corners.map((c) => c.lambert.y)) || 0;

    return { bottomLeft: { x: minX, y: maxY }, topRight: { x: maxX, y: minY } };
}

const minX =
    _.min(
        fileNamesWithBbox.map(
            ({
                bbox: {
                    bottomLeft: { x },
                },
            }) => x,
        ),
    ) || 0;
const minY =
    _.min(
        fileNamesWithBbox.map(
            ({
                bbox: {
                    topRight: { y },
                },
            }) => y,
        ),
    ) || 0;
const maxY =
    _.max(
        fileNamesWithBbox.map(
            ({
                bbox: {
                    bottomLeft: { y },
                },
            }) => y,
        ),
    ) || 0;
const maxX =
    _.max(
        fileNamesWithBbox.map(
            ({
                bbox: {
                    topRight: { x },
                },
            }) => x,
        ),
    ) || 0;

const width = (maxX - minX) / LAMBERT_PER_PIXEL;
const height = (maxY - minY) / LAMBERT_PER_PIXEL;
sharp({
    create: {
        width,
        height,
        channels: 4,
        background: { r: 255, g: 0, b: 0, alpha: 0.5 },
    },
    limitInputPixels: false,
})
    .composite(
        fileNamesWithBbox.map(({ fileName, bbox }) => ({
            input: fileName,
            left: (bbox.bottomLeft.x - minX) / LAMBERT_PER_PIXEL,
            top: (maxY - bbox.topRight.y) / LAMBERT_PER_PIXEL - 8000,
        })),
    )
    .tiff()
    .toBuffer()
    .then((buffer) =>
        Promise.all([sharp(buffer, { limitInputPixels: false }).tiff().toFile('big.tif')]),
    );
