const rules = require('./webpack.rules');
const path = require('path');

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

module.exports = {
  // Put your normal webpack config below here
  module: {
    rules,
  },
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@renderer': path.resolve(__dirname, 'src/renderer'),
      '@components': path.resolve(__dirname, 'src/renderer/components'),
      '@services': path.resolve(__dirname, 'src/renderer/services'),
      '@store': path.resolve(__dirname, 'src/renderer/store'),
    },
  },
  entry: {
    index: './src/renderer/index.tsx',
    overlay: './src/renderer/overlay.js',
  },
};
