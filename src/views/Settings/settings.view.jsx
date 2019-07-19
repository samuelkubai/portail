import { ipcRenderer } from 'electron';
import { audioDevices } from 'aperture';
import React, { Component } from 'react';

import SettingsStore from '../../utils/Settings';

export default class Settings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      audioDevices: [],
      settings: {
        activeVideo: true,
        activeAudio: false,
        audioSource: 'built-in-microphone',
        portailDir: '',
        videoSource: 'default',
      }
    };

    this.getSetting.bind(this);
    this.init.bind(this);
    this.updateSettings.bind(this);

    ipcRenderer.on('destination-selected', (evt, arg) => {
      this.updateSettings({
        name: 'portailDir',
        value: arg.file
      })
    });
  }

  componentDidMount() {
    this.init();
  }

  getSetting(name) {
    return this.state.settings[name];
  }

  init() {
    const { settings } = this.state;

    // Initialize the settings to the defaults
    for (const setting in settings) {
      if(settings.hasOwnProperty(setting)) {
        this.updateSettings({
          name: setting,
          value: SettingsStore.instance.store.get(setting)
        });
      }
    }

    // Initialize audio devices
    audioDevices().then(devices => {
      this.setState(state => {
        return Object.assign(state, { audioDevices: devices });
      });
    });
  }

  static selectDestinationPath() {
    console.log('selectDestinationPath(): Select the destination path');
    ipcRenderer.send('pick-destination');
  }

  static shortenMessage(message) {
    return "..." + message.substring(message.length - 18, message.length)
  }

  updateSettings({ name, value }) {
    let { settings } = this.state;

    // Update the specific setting
    settings[name] = value;

    this.setState(state => {
      return Object.assign(state, {
        settings
      });
    }, () => {
      SettingsStore.instance.store.set(name, value);
    });
  }

  render() {
    const { audioDevices } = this.state;

    return (
      <div className="fragment">
        <ul className="c-settings">
          <li className="c-settings-option">
            <div className="c-settings-option__description">
              <div className="c-settings-option__title">
                Save to...
              </div>
              <div className="c-settings-option__description">
                {Settings.shortenMessage(this.getSetting('portailDir'))}
              </div>
            </div>

            <div className="c-settings-option__action">
              <button
                className="c-settings-option__file-explorer"
                onClick={() => Settings.selectDestinationPath()}
              >
                Choose
              </button>
            </div>
          </li>
          <li className="c-settings-option">
            <div className="c-settings-option__description">
              <div className="c-settings-option__title">
                Always have video
              </div>
              <div className="c-settings-option__description">
                Activate the webcam video by default
              </div>
            </div>

            <div className="c-settings-option__action">
              <input
                type="checkbox"
                className="c-settings-option__switch"
                checked={this.getSetting('activeVideo')}
                onChange={() => {
                  this.updateSettings({
                    name: 'activeVideo',
                    value: !this.getSetting('activeVideo')
                  })
                }}
              />
            </div>
          </li>
          <li className="c-settings-option">
            <div className="c-settings-option__description">
              <div className="c-settings-option__title">
                Pick preferred video source
              </div>
              <div className="c-settings-option__description">
                Select your preferred default video source
              </div>
            </div>

            <div className="c-settings-option__action">
              <select
                className="c-settings-option__select"
                value={this.getSetting('videoSource')}
                onChange={evt => {
                  this.updateSettings({
                    name: 'videoSource',
                    value: evt.target.value
                  })
                }}
              >
                <option
                  value="default"
                >
                  Default
                </option>
                <option
                  value="default-1"
                >
                  Default 1
                </option>
              </select>
            </div>
          </li>
          <li className="c-settings-option">
            <div className="c-settings-option__description">
              <div className="c-settings-option__title">
                Always have audio
              </div>
              <div className="c-settings-option__description">
                Activate the microphone by default
              </div>
            </div>

            <div className="c-settings-option__action">
              <input
                type="checkbox"
                className="c-settings-option__switch"
                checked={this.getSetting('activeAudio')}
                onChange={() => {
                  this.updateSettings({
                    name: 'activeAudio',
                    value: !this.getSetting('activeAudio')
                  })
                }}
              />
            </div>
          </li>
          <li className="c-settings-option">
            <div className="c-settings-option__description">
              <div className="c-settings-option__title">
                Pick preferred audio source
              </div>
              <div className="c-settings-option__description">
                Select your preferred default audio source
              </div>
            </div>

            <div className="c-settings-option__action">
              <select
                className="c-settings-option__select"
                value={this.getSetting('audioSource')}
                onChange={evt => {
                  this.updateSettings({
                    name: 'audioSource',
                    value: evt.target.value
                  })
                }}
              >
                {
                  audioDevices.map(device => (
                    <option key={device.id} value={device.id}>
                      {device.name}
                    </option>
                  ))
                }
              </select>
            </div>
          </li>
        </ul>
      </div>
    );
  }
}
