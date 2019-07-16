import React, { Component, PropTypes } from 'react';

export default class Input extends Component {
  constructor(props) {
    super(props);

    this.onChange.bind(this);
  }

  onChange({ a, c }) {
    const { active, choice, onChange, type } = this.props;

    onChange({
      active: a !== undefined ? a : active,
      choice: c ? c : choice,
      type
    })
  }

  render() {
    const { active, choice, icon, name, options } = this.props;

    return (
      <div className="c-input">
        <button
          onClick={() => {
            this.onChange({ a: !active });
          }}
          className={`c-input__button ${active ? 'c-input__button--active' : ''}`}
        >
          { React.createElement(icon, { cancelled: !active, fill: active ? '#153C55' : '#8595A9' }) }
        </button>

        <select
          className="c-input__options"
          name={name}
          id={`id-${name}`}
          value={choice}
          onChange={evt => {
            this.onChange({ c: evt.target.value })
          }}
        >
          {
            options.map(option => (
              <option
                key={option.id}
                className="c-input__options"
                value={option.id}
              >
                {option.name}
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
