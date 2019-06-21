import React, { Component, PropTypes } from 'react';

export default class Button extends Component {
  render() {
    const { recording, onClick } = this.props;

    return (
      <div
        role="presentation"
        onClick={onClick}
        className="c-button c-button--primary"
      >
        {
          recording ?
            'Stop Recording' :
            'Start Recording'
        }
      </div>
    );
  }
}

Button.propTypes = {
  recording: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};
