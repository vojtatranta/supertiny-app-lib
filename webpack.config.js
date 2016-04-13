var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var PROD = process.env.NODE_ENV === 'production'

module.exports = {
  devtool: PROD ? null : 'cheap-module-eval-source-map',
  entry: PROD ? './app' : [
    'webpack/hot/dev-server',
    './'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  plugins: PROD ?
    [
      new ExtractTextPlugin('style.css', {allChunks: true}),
      new webpack.optimize.UglifyJsPlugin({minimize: true, comments: false}),
      new webpack.DefinePlugin({
        'process.env': {
          'NODE_ENV': PROD
        }
      })
    ] :
    [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoErrorsPlugin()
  ],
  resolve: {
    extensions: ['', '.js']
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loaders: ['babel'],
      exclude: /node_modules/,
      include: __dirname
    },
    {
      test: /\.sass$/,
      loader: PROD ? ExtractTextPlugin.extract('style-loader', 'css-loader?minimize!autoprefixer-loader?browsers=last 2 version!sass-loader?indentedSyntax') : 'style-loader!css-loader!autoprefixer-loader?browsers=last 2 version!sass-loader?indentedSyntax'
    },
    {
      test: /\.css$/,
      loader: PROD ? ExtractTextPlugin.extract('style-loader', 'css-loader?minimize') : 'style!css'
    },
    {
      test: /.*\.(gif|png|jpe?g|svg)$/i,
      loaders: [
        'file?hash=sha512&digest=hex&name=[hash].[ext]',
        'image-webpack?{progressive:true, optimizationLevel: 7, interlaced: false, pngquant:{quality: "65-90", speed: 4}}'
      ]
    }]
  }
};
