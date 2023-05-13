const path = require("path");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

const tsconfig = path.join(__dirname, "tsconfig.json");

module.exports = {
  mode: "production",

  module: {
    rules: [
      {
        test: /\.ts$/,
        loader:  "ts-loader",
        exclude: /node_modules/,
        options: {
          configFile: tsconfig
        }
      },
      {
        test: /\.scss$/,
        use: ["css-loader", "sass-loader"],
        exclude: /node_modules/
      },
      {
        test: /.svg$/,
        loader: "svg-inline-loader",
      }
    ]
  },

  resolve: {
    modules: ["node_modules"],

    extensions: [".ts", ".js"],

    plugins: [
      new TsconfigPathsPlugin({
        configFile: tsconfig
      })
    ]
  }
}