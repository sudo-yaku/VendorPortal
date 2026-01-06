const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CompressionPlugin = require('compression-webpack-plugin')
// const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
const TerserPlugin = require("terser-webpack-plugin");
const APP_ENV = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';
const SSO = process.env.SSO ? true : false;
const baseSSOPath = SSO ? APP_ENV != 'production' ? '/sso' : '/sso' : ''
const VERSION = (new Date()).getTime()
const LDAP = false;
let envVariablePath = "";
let indexTemplateFile = 'src/index.ejs'

switch (APP_ENV) {
  case 'production4g':
    envVariablePath = "/";
    indexTemplateFile = 'src/indexProduction.ejs'
    break;
  case 'staging':
    envVariablePath = "/vendorportaltest/";
    indexTemplateFile = 'src/indexStaging.ejs'
    break;
  case 'development':
    break;
  default:
    break;
}

// Added for ISSO path
if (baseSSOPath) {
  envVariablePath = `${baseSSOPath}${envVariablePath}`
}
module.exports = {
  // mode: 'development',
  resolve: {
    fallback: {
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify"),
      "buffer": require.resolve("buffer/"),
      "vm": require.resolve("vm-browserify"),
      "fs": false
    }
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
  entry: {
    bundle: [
      path.resolve(__dirname, 'src/polyfill.js'),
      path.resolve(__dirname, 'src/index.js')],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name][contenthash].js',
    clean: true,
    assetModuleFilename: '[name][ext]',
    publicPath: envVariablePath
  },
  // devtool: 'inline-source-map',
  devServer: {
    static: {
      directory: path.resolve(__dirname, 'dist'),
    },
    client: {
      overlay: false,
    },
    port: 3001,
    // open: true,
    // hot: true,
    compress: true,
    historyApiFallback: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      { test: /\.scss$/, use: ["style-loader", "css-loader", "sass-loader"] },
      { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, use: ["file-loader"] },
      { test: /\.mp3$/, use: ["file-loader"] },
      { test: /\.docx$/, use: ["file-loader"] },
      { test: /\.pdf$/, use: ["file-loader"] },
      { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, use: [{ loader: "url-loader", options: { limit: 10000, mimetype: "application/font-woff" } }] },
      { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, use: [{ loader: "url-loader", options: { limit: 10000, mimetype: "application/octet-stream" } }] },
      { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, use: [{ loader: "url-loader", options: { limit: 10000, mimetype: "image/svg+xml" } }] },
      { test: /\.(png|jpg|gif)$/, use: [{ loader: "file-loader" }] }
    ],
  },
  plugins: [
    // new LodashModuleReplacementPlugin(),
    new CompressionPlugin(),
    new MiniCssExtractPlugin({ignoreOrder: true}),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: indexTemplateFile,
      hash: true,
    }),
    new webpack.DefinePlugin({
      APP_ENV: JSON.stringify(APP_ENV),
      NODE_ENV: JSON.stringify(APP_ENV),
      SSO: JSON.stringify(SSO),
      VERSION: JSON.stringify(VERSION),
      LDAP: JSON.stringify(LDAP),
      'process.env.NODE_ENV': JSON.stringify(APP_ENV),
      'global.NODE_ENV': JSON.stringify(APP_ENV),
      'global.SSO': JSON.stringify(SSO),
      'global.VERSION': JSON.stringify(VERSION),
      'global.LDAP': JSON.stringify(LDAP),
      'global.baseSSOPath': JSON.stringify(baseSSOPath) //added for isso path
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser'
    }),
  ]
}
