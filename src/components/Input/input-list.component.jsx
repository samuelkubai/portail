import React, { Component } from 'react';

import Input from './input.component';
import MicrophoneIcon from '../../icons/microphone.icon';
import VideoIcon from '../../icons/video.icon';

export default class InputList extends Component {
  render() {
    const inputs = [
      {
        name: 'Microphone',
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
          inputs.map((input, index) => <Input key={index} {...input} />)
        }
      </div>
    );
  }
}
