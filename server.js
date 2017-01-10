import webpack from 'webpack';
import path from 'path';
import WebpackDevServer from 'webpack-dev-server';
import config from './webpack.config';
import open from 'open';

/* eslint-disable no-console */

var devServer = new WebpackDevServer(webpack(config), {
	publicPath: config.output.publicPath,
	hot: true,
	historyApiFallback: true,
	stats: {
		colors: true,
		chunks: false,
		modules: false
	},
})

devServer.listen(3000, (err) => {
	if (err) {
		console.log(err);
		return;
	}
	console.log('Proxy is listening on port 3000!');
});
