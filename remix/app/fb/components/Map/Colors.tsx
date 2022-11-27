import { ConfigProvider } from 'antd';

export const Colors = {
    ctrBorderBlue: '#002e94',
    ctrBorderLightBlue: '#99ABD1',
    ctrBorderVeryLightBlue: '#BACEE2',
    tmaBorderViolet: '#8c00ff',
    tmaBorderLightViolet: '#D1B3FF',
    pThinBorder: '#940000',
    pThickBorder: '#940000',
    sivThickBorder: '#739880',
    // sivThinBorder: '#407F56',
    sivThinBorder: '#2b8049',
    red: '#940000',
    lightRed: '#FF0000',

    flightplotLogoBlue: '#002e94',
    // Yellow
    highlitFixtureBorder: '#b65800',
    highlitFixture: '#ff7b00',

    // Route
    routeIntermediateWaypoint: '#000000',
    routeFinalWaypoint: '#940000',

    mainThemeColor: '#002e94',
    white: '#ffffff',
};

ConfigProvider.config({
    theme: {
        primaryColor: Colors.flightplotLogoBlue,
    },
});
