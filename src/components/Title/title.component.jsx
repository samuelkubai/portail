import React, { Component } from 'react';
import { ipcRenderer } from 'electron';
import open from 'electron-open-url';

import Screen from '../../utils/Screen';

export default class Title extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dropdownIsOpen: false
    };

    this.launchSetting.bind(this);
    this.toggleDropdown.bind(this);
  }

  launchSetting() {
    const { onSettings } = this.props;

    onSettings();
  }

  static openSite() {
    open({
      target: 'https://portail.app',
      fallback: true
    })
  }

  static quitApplication() {
    ipcRenderer.send('quit-application');
  }

  toggleDropdown() {
    this.setState(state => {
      return Object.assign(state, { dropdownIsOpen: !state.dropdownIsOpen });
    });
  }

  render() {
    const { dropdownIsOpen } = this.state;

    return (
      <div className="c-title">
        <div className="c-title__logo">
          <span className="c-title__logo-highlight">P</span>ortail
        </div>

        <ul className="c-title__actions">
          <li
            role="presentation"
            onClick={() => this.launchSetting()}
          >
            <img src="./assets/settings.svg" alt="Settings" />
          </li>
          <li onClick={() => this.toggleDropdown()}>
            <img src="./assets/ellipsis.svg" alt="More" />
            {
              dropdownIsOpen &&
              (
                <div className="c-dropdown">
                  <ul>
                    <li className="c-dropdown__item">
                      <a href="#" onClick={() => Title.openSite()}>Visit Site</a>
                    </li>
                    <li className="c-dropdown__item">
                      <a href="#" onClick={() => Title.quitApplication()}>Quit</a>
                    </li>
                  </ul>
                </div>
              )
            }
          </li>
        </ul>
      </div>
    );
  }
}
