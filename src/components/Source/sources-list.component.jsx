import React, { Component } from 'react';

import DesktopIcon from '../../icons/desktop.icon';
import WindowsIcon from '../../icons/windows.icon';

export default class SourcesList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedSource: 'desktop',
    };

    this.selectSource.bind(this);
  }

  selectSource(source) {
    this.setState(() => ({
      selectedSource: source,
    }));
  }

  render() {
    const { selectedSource } = this.state;

    return (
      <ul className="c-sources-list">
        <li onClick={() => { this.selectSource('desktop'); }}
            className={`c-source ${selectedSource === 'desktop' ? 'c-source--active' : ''}`}>
          <DesktopIcon fill={`${selectedSource === 'desktop' ? '#FFFFFF' : '#153C55'}`} />
          <div className="c-source__label">Full screen</div>
        </li>
        <li onClick={() => { this.selectSource('windows'); }}
            className={`c-source ${selectedSource === 'windows' ? 'c-source--active' : ''}`}>
          <WindowsIcon fill={`${selectedSource === 'windows' ? '#FFFFFF' : '#153C55'}`} />
          <div className="c-source__label">Window</div>
        </li>
      </ul>
    );
  }
}
