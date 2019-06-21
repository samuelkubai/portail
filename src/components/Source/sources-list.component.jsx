import React, { Component } from 'react';

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
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
        <li
          onClick={() => { this.selectSource('desktop'); }}
          className={`c-source ${selectedSource === 'desktop' ? 'c-source--active' : ''}`}
        >
          <div className="c-source__label">Full screen</div>
          <div className="c-source__action">Select Screen</div>
        </li>
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
        <li
          onClick={() => { this.selectSource('windows'); }}
          className={`c-source ${selectedSource === 'windows' ? 'c-source--active' : ''}`}
        >
          <div className="c-source__label">Window</div>
          <div className="c-source__action">Select App</div>
        </li>
      </ul>
    );
  }
}
