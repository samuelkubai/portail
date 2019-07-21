module.exports = {
  makers: [
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
      config: {
        name: 'Portail',
        config: {
          icon: './src/assets/icon.png',
          iconSize: 160,
        },
      },
    },
  ],
};
