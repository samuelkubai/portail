import React, { Component } from 'react';

import Input from './input.component';
import MicrophoneIcon from '../../icons/microphone.icon';
import VideoIcon from '../../icons/video.icon';

export default class InputList extends Component {
  constructor(props) {
    super(props);

    this.isInputActive.bind(this);
  }

  isInputActive(type) {
    const state = this.props.inputState.filter(i => i.type === type)[0];
    return state && state.active;
  }

  render() {
    const { onUpdate } = this.props;
    const inputs = [
      {
        name: 'Microphone',
        type: 'microphone',
        icon: MicrophoneIcon,
        options: [
          {
            label: 'Built-in microphone',
            value: 'built-in-microphone',
          },
          {
            label: 'Headset',
            value: 'headset',
          },
        ],
      },
      {
        name: 'Camera',
        type: 'camera',
        icon: VideoIcon,
        options: [
          {
            label: 'Built-in web camera',
            value: 'built-in-web-camera',
          },
        ],
      },
    ];

    return (
      <div className="c-input-list">
        <div className="c-input-list__title">
          <button className="c-input-list__link">Advanced Settings</button>
        </div>
        {
          // eslint-disable-next-line react/no-array-index-key
          inputs.map((input, index) => <Input active={this.isInputActive(input.type)} key={index} {...input} onChange={onUpdate} />)
        }
      </div>
    );
  }
}
