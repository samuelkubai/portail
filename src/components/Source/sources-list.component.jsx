import React, { Component, PropTypes } from 'react';

export default class SourcesList extends Component {
  render() {
    const { source, onSelect } = this.props;

    return (
      <ul className="c-sources-list">
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
        <li
          onClick={() => { onSelect('desktop'); }}
          className={`c-source ${source === 'desktop' ? 'c-source--active' : ''}`}
        >
          <div className="c-source__label">Full screen</div>
          <div className="c-source__action">Select Screen</div>
        </li>
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
        <li
          onClick={() => { onSelect('custom'); }}
          className={`c-source ${source === 'custom' ? 'c-source--active' : ''}`}
        >
          <div className="c-source__label">Custom</div>
          <div className="c-source__action">Select Area</div>
        </li>
      </ul>
    );
  }
}

SourcesList.propTypes = {
  onSelect: PropTypes.func.isRequired,
  source: PropTypes.string.isRequired,
};
