import React, { Component, PropTypes } from 'react';

import BackIcon from '../../icons/back.icon';

export default class Nav extends Component {
  render() {
    const { title, onBack } = this.props;

    return (
      <div className="c-nav">
        <div role="presentation" className="c-nav__icon" onClick={onBack}>
          <BackIcon />
        </div>
        <div className="c-nav__title">
          { title }
        </div>
      </div>
    );
  }
}

Nav.propTypes = {
  title: PropTypes.string.isRequired,
  onBack: PropTypes.func.isRequired,
};
