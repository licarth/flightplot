const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
module.exports = {
    stories: ['../stories/**/*.stories.mdx', '../stories/**/*.stories.@(js|jsx|ts|tsx)'],
    addons: [
        '@storybook/addon-links',
        '@storybook/addon-essentials',
        '@storybook/addon-interactions',
    ],
    framework: '@storybook/react',
    webpackFinal: async (config, { configType }) => {
        const leafletRule = {
            test: /\.js$/,
            // if you're smarter than me, you could also do it via MatchPattern 🤷‍♀️
            include: [
                /node_modules\/@react-leaflet/,
                /node_modules\/react-leaflet/,
                /node_modules\/metar-taf-parser/,
            ],
            use: [
                {
                    loader: 'babel-loader',
                    options: {
                        presets: [['@babel/preset-env', { modules: 'commonjs' }]],
                    },
                },
            ],
        };

        config.resolve.plugins = [new TsconfigPathsPlugin()];
        config.module.rules.push(leafletRule);
        return config;
    },
    staticDirs: ['../public'],
};
