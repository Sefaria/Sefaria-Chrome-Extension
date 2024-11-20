const path = require('path');
const webpack = require('webpack');
const merge = require('merge-deep');
const BundleTracker = require('webpack-bundle-tracker');

const buildDir = './';

const baseConfig = {
    devtool: 'source-map',
    stats: {
        errorDetails: true,
        colors: true
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            '@babel/preset-react',
                            ['@babel/preset-env', { targets: "last 2 versions" }]
                        ],
                        plugins: ['@babel/plugin-proposal-object-rest-spread']
                    }
                }
            }
        ]
    },
    resolve: {
        modules: ['node_modules'],
        extensions: ['.jsx', '.js']
    },
    context: path.resolve('./js'),
    optimization: {
        moduleIds: 'deterministic',
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name(module, chunks, cacheGroupKey) {
                        return `${chunks[0].name}-vendor`;
                    },
                    chunks: 'all'
                }
            }
        }
    }
};

const createConfig = (overrides) => merge(baseConfig, overrides || {});

const mainConfig = createConfig({
    entry: {
        main: './main'
    },
    output: {
        path: path.resolve(buildDir, "bundle_prod"),
        filename: '[name]-bundle.js',
        chunkFilename: '[name].chunk.js',
        clean: true
    },
    plugins: [
        new BundleTracker({
            path: path.resolve(buildDir),
            filename: 'webpack-stats.json'
        }),
        new webpack.ProvidePlugin({
            global: require.resolve('./global.js')
        })
    ],
    node: {
        global: false
    }
});

const backgroundConfig = createConfig({
    entry: {
        background: './background'
    },
    output: {
        path: path.resolve(buildDir, "bundle_prod"),
        filename: '[name]-bundle.js',
        chunkFilename: '[name].chunk.js',
        clean: true
    }
});

// Development configurations
const mainDevConfig = merge(mainConfig, {
    mode: 'development',
    output: {
        path: path.resolve(buildDir, "bundle_dev"),
        filename: '[name]-bundle.js',
        chunkFilename: '[name].chunk.js'
    }
});

const backgroundDevConfig = merge(backgroundConfig, {
    mode: 'development',
    output: {
        path: path.resolve(buildDir, "bundle_dev"),
        filename: '[name]-bundle.js',
        chunkFilename: '[name].chunk.js'
    }
});

// Production configurations
const mainProdConfig = merge(mainConfig, {
    mode: 'production',
    optimization: {
        minimize: true
    }
});

const backgroundProdConfig = merge(backgroundConfig, {
    mode: 'production',
    optimization: {
        minimize: true
    }
});

module.exports = [mainDevConfig, backgroundDevConfig, mainProdConfig, backgroundProdConfig];