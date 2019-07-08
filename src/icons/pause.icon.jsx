import React, { Component } from 'react';

export default class PauseIcon extends Component {
  render() {
    const { fill } = this.props;

    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6.34089 0C5.88966 0 5.52271 0.366955 5.52271 0.818182V17.1818C5.52271 17.633 5.88966 18 6.34089 18C6.79211 18 7.15907 17.633 7.15907 17.1818V0.818182C7.15907 0.366955 6.79211 0 6.34089 0Z" fill={fill} />
        <path d="M11.6591 0C11.2078 0 10.8409 0.366955 10.8409 0.818182V17.1818C10.8409 17.633 11.2078 18 11.6591 18C12.1103 18 12.4772 17.633 12.4772 17.1818V0.818182C12.4772 0.366955 12.1103 0 11.6591 0Z" fill={fill} />
      </svg>
    );
  }
}

PauseIcon.defaultProps = {
  fill: '#1E2834',
};
