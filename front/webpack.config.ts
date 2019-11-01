import * as path from 'path';
import * as webpack from 'webpack';
import * as ExtractTextPlugin from 'extract-text-webpack-plugin';
import * as CopyPlugin from 'copy-webpack-plugin';

const localNodeModulesPath = path.resolve('./node_modules');
const projectFolder = path.resolve('./front');
const srcPath = path.resolve(projectFolder, './src');
const resPath = path.resolve(projectFolder, './res');
const buildFolder = path.resolve('./build/front');

interface Hosts {
    client: string;
    api: string;
}

const configs = [
    {
        webpack: () => ({
            entry: () => path.resolve(srcPath, `./admin/index.tsx`),
            output: {
                path: path.resolve(buildFolder, './bundles'),
                filename: `admin.bundle.js`
            },
            plugins: [
                new ExtractTextPlugin('admin.bundle.css'),
                new CopyPlugin([
                    {
                        from: resPath,
                        to: path.resolve(buildFolder, './res')
                    }
                ])
            ]
        }),
        tsConfigFileName: path.resolve(projectFolder, './tsconfig.json')
    },
    {
        webpack: () => ({
            entry: () => path.resolve(srcPath, `./client/index.tsx`),
            output: {
                path: path.resolve(buildFolder, './bundles'),
                filename: `client.bundle.js`
            },
            plugins: [
                new ExtractTextPlugin('client.bundle.css')
            ]
        }),
        tsConfigFileName: path.resolve(projectFolder, './tsconfig.json')
    }
];

const babelPlugins = [
    '@babel/plugin-transform-modules-commonjs',
    '@babel/plugin-transform-react-display-name',
    '@babel/plugin-syntax-dynamic-import',
    ['@babel/plugin-proposal-decorators', {
        legacy: true
    }],
    '@babel/plugin-proposal-class-properties',
    ['@babel/plugin-proposal-object-rest-spread', {
        useBuiltIns: true
    }],
    ['@babel/plugin-transform-runtime', {
        regenerator: true
    }]
];

const babelOptions = {
    comments: true,
    presets: [
        '@babel/preset-react',
        ['@babel/preset-env', {
            modules: 'commonjs',
            loose: true
        }]
    ],
    plugins: babelPlugins
};

function getBaseConfig(isProduction: boolean, tsConfigFileName: string): webpack.Configuration {
    return {
        mode: isProduction ? 'production' : 'development',
        devtool: isProduction ? false : 'source-map',
        target: 'web',
        resolve: {
            alias: {
                admin: path.resolve(srcPath, './admin'),
                client: path.resolve(srcPath, './client'),
                libs: path.resolve(srcPath, './libs'),
                common: path.resolve(srcPath, './common')
            },
            modules: [
                srcPath,
                localNodeModulesPath
            ],
            extensions: ['.js', '.jsx', '.ts', '.tsx']
        },
        resolveLoader: {
            modules: [localNodeModulesPath],
            extensions: ['.js', '.json'],
            mainFields: ['loader', 'main']
        },
        externals: {},
        module: {
            rules: [
                {
                    test: /\.ts(x?)$/,
                    exclude: /node_modules/,
                    use: [
                        /* {
                            loader: 'cache-loader'
                        }, */
                        {
                            loader: 'babel-loader',
                            options: babelOptions
                        },
                        {
                            loader: 'awesome-typescript-loader',
                            options: {
                                configFileName: tsConfigFileName
                            }
                        }
                    ]
                },
                {
                    test: /\.(css|scss)$/,
                    use: ExtractTextPlugin.extract({
                        fallback: 'style-loader',
                        use: ['css-loader', 'sass-loader']
                    })
                }
            ]
        }
    }
}

export default () => configs.map((config) => {
    const isProduction = process.argv.find((x) => x === '--mode=production');

    return {
        ...config.webpack(),
        ...getBaseConfig(Boolean(isProduction), config.tsConfigFileName)
    }
});

