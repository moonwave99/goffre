const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const postcssNormalize = require("postcss-normalize");

const config = {
    entry: [
        "@babel/polyfill",
        "./src/client/index.js",
        path.join(__dirname, "src", "client", "css", "style.css"),
    ],
    output: {
        path: path.join(__dirname, "dist"),
        filename: "bundle.js",
    },
    devServer: {
        static: {
            directory: path.join(__dirname, "dist"),
            serveIndex: false,
        },
        historyApiFallback: {
            verbose: true,
            htmlAcceptHeaders: ["text/html", "application/xhtml+xml"],
            rewrites: [
                {
                    from: /^\/.*$/,
                    to: (context) => {
                        const { pathname } = context.parsedUrl;
                        return `${
                            pathname.endsWith("/")
                                ? pathname.slice(0, -1)
                                : pathname
                        }.html`;
                    },
                },
            ],
        },
        compress: true,
        port: 9000,
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: "babel-loader",
                resolve: {
                    fullySpecified: false,
                },
            },
            {
                test: /\.css$/i,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: "css-loader",
                        options: {
                            url: false,
                        },
                    },
                    {
                        loader: "postcss-loader",
                        options: {
                            postcssOptions: {
                                plugins: [postcssNormalize()],
                            },
                        },
                    },
                ],
            },
        ],
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "bundle.css",
        }),
    ],
};

module.exports = config;
