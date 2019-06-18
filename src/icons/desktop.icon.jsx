import React, { Component } from 'react';

export default class DesktopIcon extends Component {
  render() {
    const { fill } = this.props;

    return (
      <svg width="28" height="24" viewBox="0 0 28 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clip-path="url(#clip0)">
          <path d="M28 17.9164V0.0273438H0.0511798V17.9164H13.3336V22.6528H8.78027V23.9243H19.2709V22.6528H14.7177V17.9164H28ZM1.4339 16.6449V1.29887H26.6173V16.6449H1.4339Z" fill={fill}/>
        </g>
        <defs>
          <clipPath id="clip0">
            <rect width="28" height="24" fill="white"/>
          </clipPath>
        </defs>
      </svg>

    );
  }
}
