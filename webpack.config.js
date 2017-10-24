var webpack = require('webpack');
var PROD = JSON.parse(process.env.PROD_ENV || '0');

module.exports = {
    entry: [
        'babel-polyfill', './public/script/main.js'
    ],
    output: {
        filename: './public/bundle.js',
        libraryTarget: 'var',
        library: 'bundle'
    },
    module: {
        loaders: [
            {
                test: /\.js?$/,
                exclude: /node_modules/,
                loaders: [
                    'babel-loader'
                ]
            }
        ]
    },
    plugins: PROD ? [
        new webpack.optimize.UglifyJsPlugin({
        compress: { warnings: false }
        })
    ] : [],
    watch: true,
    devtool: "inline-source-map"
};

//PROD_ENV=1 webpack