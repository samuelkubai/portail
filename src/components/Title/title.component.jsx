import React, { Component } from 'react';

export default class Title extends Component {
  render() {
    return (
      <div className="c-title">
        <div className="c-title__logo">
          <span className="c-title__logo-highlight">P</span>ortail
        </div>

        <ul className="c-title__actions">
          <li><img src="./assets/settings.svg" alt="Settings" /></li>
          <li><img src="./assets/ellipsis.svg" alt="More" /></li>
        </ul>
      </div>
    );
  }
}
