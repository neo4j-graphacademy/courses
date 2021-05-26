const path = require('path');

module.exports = {
    mode: 'development',
    entry: './resources/ts/app.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader?configFile=tsconfig.frontend.json',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'public', 'js'),
    },
    watch: true,
    watchOptions: {
        ignored: [ '**/node_modules', 'src' ],
    },
};