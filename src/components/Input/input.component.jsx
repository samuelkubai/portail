import React, { Component, PropTypes } from 'react';

export default class Input extends Component {
  constructor(props) {
    super(props);
    this.state = {
      active: true,
    };

    this.toggleActive.bind(this);
  }

  toggleActive() {
    this.setState(state => ({
      active: !state.active,
    }));
  }

  render() {
    const { active } = this.state;
    const { icon, name, options } = this.props;

    return (
      <div className="c-input">
        <button
          onClick={() => {
            this.toggleActive();
          }}
          className={`c-input__button ${active ? 'c-input__button--active' : ''}`}
        >
          { React.createElement(icon, { cancelled: !active, fill: active ? '#153C55' : '#8595A9' }) }
          {/* <img src={icon} alt={name} /> */}
        </button>

        <select className="c-input__options" name={name} id={`id-${name}`}>
          {
            options.map(option => (
              <option className="c-input__options" value={option.value}>{option.label}</option>
            ))
          }
        </select>
      </div>
    );
  }
}

Input.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  icon: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  options: PropTypes.array.isRequired,
};
