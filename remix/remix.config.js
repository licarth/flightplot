/**
 * @type {import('@remix-run/dev/config').AppConfig}
 */
module.exports = {
    appDirectory: 'app',
    assetsBuildDirectory: 'public/build',
    publicPath: '/build/',
    serverBuildDirectory: 'build',
    devServerPort: 8002,
    ignoredRouteFiles: ['.*'],
    serverDependenciesToBundle: [
        'react-leaflet',
        '@react-leaflet/core',
        '@marfle/react-leaflet-nmscale',
        'react-merge-refs',
        'metar-taf-parser',
    ],
};
