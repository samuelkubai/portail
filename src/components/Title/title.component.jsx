import React, { Component } from 'react';
import Screen from '../../utils/Screen';

export default class Title extends Component {
  constructor(props) {
    super(props);

    this.launchSetting.bind(this);
  }

  launchSetting() {
    const { onSettings } = this.props;

    Screen.getPrimaryWindow((area, error) => {
      console.log(`Title.launchSetting(): Primary window: `, area);
      console.log(`Title.launchSetting(): Error: `, error);
      if (!error) {
        onSettings(area);
      }
    });
  }

  render() {
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
          <li><img src="./assets/ellipsis.svg" alt="More" /></li>
        </ul>
      </div>
    );
  }
}
