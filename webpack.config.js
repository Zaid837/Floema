const webpack = require("webpack");
const path = require("path");

const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const IS_DEVELOPMENT = process.env.NODE_ENV === "dev";

const dirApp = path.join(__dirname, "app");
const dirShared = path.join(__dirname, "shared");
const dirStyle = path.join(__dirname, "styles");
const dirNode = "node_modules";

module.exports = {
  entry: [path.join(dirApp, "index.js"), path.join(dirStyle, "index.scss")],

  resolve: {
    modules: [dirApp, dirShared, dirStyle, dirNode],
  },

  plugins: [
    new webpack.DefinePlugin({
      IS_DEVELOPMENT,
    }),

    new CopyWebpackPlugin({
      patterns: [
        {
          from: "./shared",
          to: "",
        },
      ],
    }),

    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css",
    }),

    new ImageMinimizerPlugin({
      minimizer: {
        implementation: ImageMinimizerPlugin.imageminMinify,
        options: {
          plugins: [
            // interlaced: Interlace gif for progressive rendering.
            ["gifsicle", { interlaced: true }],

            // progressive: Lossless conversion to progressive.
            ["jpegtran", { progressive: true }],

            // optimizationLevel (0-7): The optimization level 0 enables a set of
            // optimization operations that require minimal effort. There will be
            // no changes to image attributes like bit depth or color type, and no
            // recompression of existing IDAT datastreams. The optimization level
            // 1 enables a single IDAT compression trial. The trial chosen is what
            // OptiPNG thinks it’s probably the most effective.
            ["optipng", { optimizationLevel: 7 }],
          ],
        },
      },
    }),
    new CleanWebpackPlugin(),
  ],

  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: "",
            },
          },
          {
            loader: "css-loader",
          },
          {
            loader: "postcss-loader",
          },
          {
            loader: "sass-loader",
          },
        ],
      },
      {
        test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
        loader: "file-loader",
        options: {
          name(file) {
            return "[hash].[ext]";
          },
        },
      },
      {
        test: /\.(jpe?g|png|gif|svg|webp)$/i,
        use: [
          {
            loader: ImageMinimizerPlugin.loader,
          },
        ],
      },
      {
        test: /\.(gls|glsl|frag|vert)$/,
        exclude: /node_modules/,
        loader: "raw-loader",
      },
      {
        test: /\.(gls|glsl|frag|vert)$/,
        exclude: /node_modules/,
        loader: "glslify-loader",
      },
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
};
