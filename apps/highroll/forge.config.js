
module.exports = {
  packagerConfig: {
    asar: true,
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {},
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    {
      name: '@electron-forge/plugin-webpack',
      config: {
        mainConfig: './webpack.main.config.js',
        devServer: {
          port: 9000,
        },
        renderer: {
          config: './webpack.renderer.config.js',
          entryPoints: [
            {
              html: './src/renderer/index.html',
              js: './src/renderer/index.tsx',
              name: 'main_window',
              preload: {
                js: './src/main/preload.ts',
              },
            },
            {
              html: './src/renderer/overlay.html',
              js: './src/renderer/overlay.js',
              name: 'overlay_window',
            },
          ],
        },
      },
    },
  ],
  // Add environment variables for development
  hooks: {
    generateAssets: async () => {
      console.log('Setting NODE_ENV to development');
      process.env.NODE_ENV = 'development';
    }
  }
};
