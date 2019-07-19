import { homedir } from 'os';
import Store from 'electron-store';
import { audioDevices } from 'aperture';

class Settings {
  constructor() {
    this.store = new Store({
      schema: {
        portailDir: {
          type: 'string',
          default: `${homedir()}/Movies/Portail`,
        },
        allowAnalytics: {
          type: 'boolean',
          default: true,
        },
        activeVideo: {
          type: 'boolean',
          default: true,
        },
        activeAudio: {
          type: 'boolean',
          default: false,
        },
        audioSource: {
          type: ['string', 'null'],
          default: null,
        },
        videoSource: {
          type: 'string',
          default: 'default',
        },
      },
    });

    this.initAudioSource.bind(this);

    // Initialization code
    this.initAudioSource();
  }

  async initAudioSource() {
    const audioInputDeviceId = this.store.get('audioSource');
    const devices = await audioDevices();

    if (!Array.isArray(devices) || audioInputDeviceId) {
      return;
    }

    if (devices.length > 1) {
      this.store.set('audioSource', devices[0].id);
    }
  }
}

export default (function() {
  let singleInstance = new Settings();

  return {
    instance: singleInstance,
  };
})();
