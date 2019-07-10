import React, { Component, PropTypes } from 'react';

export default class Input extends Component {
  constructor(props) {
    super(props);

    this.toggleActive.bind(this);
  }

  toggleActive() {
    const { active, onChange, type } = this.props;
    console.log(`toggleActive(): type: ${type} active: ${active}`);
    onChange({ active: !active, type });
  }

  render() {
    const { active, icon, name, options } = this.props;

    return (
      <div className="c-input">
        <button
          onClick={() => {
            this.toggleActive();
          }}
          className={`c-input__button ${active ? 'c-input__button--active' : ''}`}
        >
          { React.createElement(icon, { cancelled: !active, fill: active ? '#153C55' : '#8595A9' }) }
        </button>

        <select className="c-input__options" name={name} id={`id-${name}`}>
          {
            options.map(option => (
              <option
                key={option.value}
                className="c-input__options"
                value={option.value}
              >
                {option.label}
              </option>
            ))
          }
        </select>
      </div>
    );
  }
}

Input.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  icon: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  options: PropTypes.array.isRequired,
};
