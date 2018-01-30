var path = require('path');
var nodeExternals = require('webpack-node-externals');
var webpack = require('webpack');
var DeepMerge = require('deep-merge');
var BundleTracker = require('webpack-bundle-tracker');

var deepmerge = DeepMerge(function (target, source, key) {
    if (target instanceof Array) {
        return [].concat(target, source);
    }
    return source;
});

const buildDir = './';
var baseConfig = {

    devtool: 'source-map', //should have better performance on incremental build over `source-map`
    plugins: [
        function () {
            this.plugin('watch-run', function (watching, callback) {
                console.log('Begin compile at ' + new Date());
                callback();
            })
        },
        new webpack.optimize.ModuleConcatenationPlugin() // puts all module code in one scope which is supposed to speed up run-time
    ],
    module: {
        loaders: [
            //a regexp that tells webpack use the following loaders on all
            //.js and .jsx files
            {
                test: /\.jsx?$/,
                //we definitely don't want babel to transpile all the files in
                //node_modules. That would take a long time.
                exclude: /node_modules/,
                //use the babel loader
                loader: 'babel-loader',
                query: {
                    //specify that we will be dealing with React code
                    presets: ['react', 'es2015'],
                    plugins: ["transform-es2015-destructuring", "transform-object-rest-spread"]
                }
            }
        ]
    },
    resolve: {
        unsafeCache: true,
        //tells webpack where to look for modules
        modules: ['node_modules'],
        //extensions that should be used to resolve modules
        extensions: ['.jsx', '.js']
    },
    stats: {
        errorDetails: true,
        colors: true
    },
    context: path.resolve('./js'),
    entry: './main',
    output: {
        path: path.resolve(buildDir + "/bundle/"),
        filename: 'main-bundle.js'
    },
    plugins: [
        new BundleTracker({filename: './webpack-stats.json'})
    ]
}

function config(overrides) {
    return deepmerge(baseConfig, overrides || {});
}

var mainConfig = config({
  entry: './main',
  output: {
      path: path.resolve(buildDir + "/bundle/"),
      filename: 'main-bundle.js'
  },
  plugins: [
      new BundleTracker({filename: './webpack-stats.json'})
  ]
});

var backgroundConfig = config({
  entry: './background',
  output: {
    path: path.resolve(buildDir + "/bundle/"),
    filename: 'background-bundle.js'
  }
});

module.exports = [mainConfig, backgroundConfig];
