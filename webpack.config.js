var webpack = require('webpack');
var path = require('path');
// var ExtractTextPlugin = require('extract-text-webpack-plugin');
var WebpackNotifierPlugin = require('webpack-notifier');
var PROD = JSON.parse(process.env.PROD_ENV || '0');
var precss = require('precss');
var autoprefixer = require('autoprefixer');

module.exports = {
	entry: PROD
		? ['./src/index']
		: [
			'react-hot-loader/patch', 'webpack-dev-server/client?http://localhost:3000', 'webpack/hot/only-dev-server', './src/index'
		],
	devServer: {
		inline: true,
		port: 3000
	},
	devtool: PROD
		? undefined
		: 'eval-source-map',
	output: {
		path: path.join(__dirname, 'build'),
		filename: PROD
			? 'bundle.min.js'
			: 'bundle.js',
		publicPath: PROD
			? "./"
			: '/static/'
	},
	module: {
		preLoaders: [
			{
				test: /\.jsx$|\.js$/,
				loader: 'eslint-loader',
				include: __dirname + '/scripts',
				exclude: /bundle\.js$/
			}
		],
		loaders: [
			{
				test: /\.js?$/,
				loaders: ['babel?cacheDirectory'],
				include: path.join(__dirname, 'src'),
				exclude: /node_modules/
			}, {
				test: /\.scss$/,
				loaders: ['style', 'css?sourceMap!postcss-loader', 'sass?sourceMap']
			}, {
				test: /\.css$/,
				loader: 'style-loader!css-loader!postcss-loader'
			}, {
				test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
				loader: "file"
			}, {
				test: /\.(ttf(\?\S*)?$|eot|gif|svg|otf|woff(2)?)(\?[a-z0-9=&.]+)?$/,
				loader: 'url-loader'
			}, {
				test: /\.jpe?g$|\.gif$|\.png$|\.svg$|\.woff$|\.ttf$|\.wav$|\.mp3$/,
				loader: "file"
			}
		]
	},
	postcss: [autoprefixer({
			browsers: [
				'Android >= 2.3',
				'BlackBerry >= 7',
				'Chrome >= 9',
				'Firefox >= 4',
				'Explorer >= 9',
				'iOS >= 5',
				'Opera >= 11',
				'Safari >= 5',
				'OperaMobile >= 11',
				'OperaMini >= 6',
				'ChromeAndroid >= 9',
				'FirefoxAndroid >= 4',
				'ExplorerMobile >= 9'
			],
			flexbox: true
		})],
	resolve: {
		root: path.resolve(__dirname),
		alias: {
			'redux-devtools/lib': path.join(__dirname, '..', '..', 'src'),
			'redux-devtools': path.join(__dirname, '..', '..', 'src'),
			'react': path.join(__dirname, 'node_modules', 'react'),
			'components': 'src/components',
			'composers': 'src/composers',
			'containers': 'src/containers',
			'helpers': 'src/helpers',
			'selectors': 'src/selectors',
			'styles': 'src/styles',
			'actions': 'src/actions'
		},
		extensions: ['', '.js']
	},
	resolveLoader: {
		'fallback': path.join(__dirname, 'node_modules')
	},
	eslint: {
		configFile: './.eslintrc'
	},
	plugins: PROD
		? [
			new webpack.DefinePlugin({
				'process.env': {
					'NODE_ENV': JSON.stringify('production')
				}
			}),
			new webpack.optimize.UglifyJsPlugin({
				compress: {
					warnings: false
				}
			})
		]
		: [new webpack.HotModuleReplacementPlugin(), new webpack.NoErrorsPlugin(), new WebpackNotifierPlugin()]
};
