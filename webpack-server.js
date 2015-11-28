const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const config = require('./webpack.config')

const port = 9000

new WebpackDevServer(webpack(config), {
	publicPath: config.output.publicPath,
	hot: true,
	historyApiFallback: true,
	stats: {
		colors: true
	}
})
.listen(port, 'localhost', ((err) => {
  if (err)
    console.log(err)

  console.log(`Listening at localhost:${port}`)
}))
