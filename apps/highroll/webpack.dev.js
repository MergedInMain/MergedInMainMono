
const path = require('path');

module.exports = {
  static: {
    directory: path.join(__dirname, '.webpack/renderer'),
  },
  port: 9000,
  hot: true,
  historyApiFallback: {
    rewrites: [
      { from: /^\/main_window(\/.*)?$/, to: '/main_window/index.html' },
      { from: /^\/overlay_window(\/.*)?$/, to: '/overlay_window/index.html' }
    ]
  },
  devMiddleware: {
    publicPath: '/',
    writeToDisk: true,
  },
  headers: {
    'Access-Control-Allow-Origin': '*'
  },
  // Enable verbose logging for debugging
  client: {
    logging: 'info',
    overlay: true
  }
};
