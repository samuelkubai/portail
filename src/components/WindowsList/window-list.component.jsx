import React, { Component, PropTypes } from 'react';

import Screen from '../../utils/Screen';

export default class WindowList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      windows: [],
    };
    this.fetchWindows.bind(this);
  }

  componentDidMount() {
    this.fetchWindows();
  }

  fetchWindows() {
    Screen.getAllWindows((windows, error) => {
      if (!error) {
        this.setState(state => Object.assign(state, { windows }));
      }
    });
  }

  render() {
    const { onSelect } = this.props;
    const { windows } = this.state;

    return (
      <div className="c-window-list">
        { windows.map(window => (
          <div
            role="presentation"
            key={window.thumbnail.toDataURL()}
            className="c-window-list__window"
            onClick={() => { onSelect(window); }}
          >
            <img src={window.thumbnail.toDataURL()} alt={window.name} />
            <div className="c-window-list__name">
              {window.name}
            </div>
          </div>
        ))}
      </div>
    );
  }
}

WindowList.propTypes = {
  onSelect: PropTypes.func.isRequired,
};
