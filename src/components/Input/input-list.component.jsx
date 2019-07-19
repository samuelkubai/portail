import aperture from 'aperture';
import React, { Component } from 'react';

import * as Constants from '../../utils/Constants';
import Input from './input.component';

export default class InputList extends Component {
  constructor(props) {
    super(props);

    this.isInputActive.bind(this);
    this.updateAudioOptions.bind(this);
  }

  isInputActive(type) {
    const state = this.props.inputs.filter(i => i.type === type)[0];
    return state && state.active;
  }

  async componentDidMount() {
    this.updateAudioOptions();
  }

  async updateAudioOptions () {
    const { inputs, onUpdate } = this.props;
    const audioDevices = await aperture.audioDevices();
    const input = inputs.filter(i => i.type === Constants.MICROPHONE_TYPE)[0];

    const audioOptions = { type: Constants.MICROPHONE_TYPE, options: audioDevices };
    if (input && !input.choice) {
      audioOptions.choice = audioDevices[0].id;
    }

    onUpdate(audioOptions);
  }

  render() {
    const { inputs, onSettings, onUpdate } = this.props;

    return (
      <div className="c-input-list">
        <div className="c-input-list__title">
          <button className="c-input-list__link" onClick={() => onSettings()}>Advanced Settings</button>
        </div>
        {
          // eslint-disable-next-line react/no-array-index-key
          inputs.map((input, index) => <Input active={this.isInputActive(input.type)} key={index} {...input} onChange={onUpdate} />)
        }
      </div>
    );
  }
}
