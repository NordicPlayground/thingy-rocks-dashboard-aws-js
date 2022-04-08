const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { ProvidePlugin, DefinePlugin } = require("webpack");
const Dotenv = require("dotenv-webpack");
const HtmlTagsPlugin = require("html-webpack-tags-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = (env) => ({
  entry: "./src/index.tsx",
  target: "web",
  mode: env.mode === "development" ? "development" : "production",
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "bundle.js",
  },
  resolve: {
    extensions: [".js", ".jsx", ".json", ".ts", ".tsx"],
  },
  externals: {
    cesium: "Cesium",
  },
  module: {
    rules: [
      {
        test: /\.(jpg|png|svg)$/,
        type: "asset/resource",
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: "asset/resource",
      },
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        enforce: "pre",
        test: /\.js$/,
        loader: "source-map-loader",
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          "style-loader",
          // Translates CSS into CommonJS
          "css-loader",
          // Compiles Sass to CSS
          "sass-loader",
        ],
      },
    ],
  },
  plugins: [
    new DefinePlugin({
      CESIUM_BASE_URL: JSON.stringify("/cesium"),
    }),
    new CopyPlugin({
      patterns: [
        {
          from: "./node_modules/cesium/Build/Cesium",
          to: "./src/cesium",
        },
      ],
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "src", "index.html"),
    }),
    new HtmlTagsPlugin({
      append: false,
      tags: ["./src/cesium/Widgets/widgets.css", "./src/cesium/Cesium.js"],
    }),
    new Dotenv(),
    new ProvidePlugin({
      process: "process/browser",
    }),
  ],
});
