var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var PROD = JSON.parse(process.env.PROD || "0");

module.exports = {
  devtool: PROD ? '' : 'cheap-module-eval-source-map',
  entry: PROD ? './app' : [
    'webpack-dev-server/client?http://localhost:9000',
    'webpack/hot/dev-server',
    './'
  ],
  output: {
    path: path.join(__dirname, 'dist', 'generated'),
    filename: 'bundle.js',
    publicPath: 'http://localhost:9000/static/'
  },
  plugins: PROD ? 
    [
      new ExtractTextPlugin('style.css', {allChunks: true}),
      new webpack.optimize.UglifyJsPlugin({minimize: true, comments: false})
    ] : 
    [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoErrorsPlugin()
  ],
  resolve: {
    extensions: ['', '.js', '.cjsx', '.coffee']
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loaders: PROD ? ['babel'] : ['babel'],
      exclude: /node_modules/,
      include: __dirname
    }, {
      test: /\.js$/,
      loaders: ['babel'],
      include: path.join(__dirname, '..', '..', 'src')
    }, {
      test: /\.cjsx$/,
      loaders: PROD ? ['coffee-loader', 'cjsx'] : ['coffee-loader', 'cjsx']
    }, {
      test: /\.coffee$/,
      loaders: ['coffee-loader']
    },
    {
      test: /\.sass$/,
      loader: PROD ? ExtractTextPlugin.extract('style-loader', 'css-loader?minimize!autoprefixer-loader?browsers=last 2 version!sass-loader?indentedSyntax') : 'style-loader!css-loader!autoprefixer-loader?browsers=last 2 version!sass-loader?indentedSyntax'
    },
    {
      test: /\.css$/,
      loader: PROD ? ExtractTextPlugin.extract('style-loader', 'style!css-loader?minimize') : 'style!css'
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
