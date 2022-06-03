const path = require('path')

module.exports = {                                         
    entry: ['babel-polyfill', './src-cli/index.js'],                             
    output: {                               
        path: path.resolve(__dirname, 'public/scripts'),
        filename: 'bundle.js'                               
    },
    module: {
        rules: [{
            test: /\.js$/,                                   
            exclude: /node_modules/,
            use: [{
                loader: 'babel-loader',
                options: {
                    presets: ['env']
                }
                }, { 
                loader: 'webpack-remove-debug' 
            }]
        }]
    },
    devtool: 'source-map'
}