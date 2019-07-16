import { ipcRenderer } from 'electron';
import React, { Component } from 'react';

import * as Constants from '../../utils/Constants';
import DeleteIcon from '../../icons/delete.icon';
import PauseIcon from '../../icons/pause.icon';
import VideoIcon from '../../icons/video.icon';
import MicrophoneIcon from '../../icons/microphone.icon';
import { CAMERA_TYPE } from '../../utils/Constants';

export default class Controls extends Component {
  constructor(props) {
    super(props);
    this.state = {
      recordingPaused: false,
      inputState: []
    };

    this.cancel.bind(this);
    this.retrieveInputFromState.bind(this);
    this.isInputActive.bind(this);

    ipcRenderer.on('update-control-panel', (evt, arg) => {
      console.log('[Control Panel Process] In the "update-control-panel" event:');
      console.log('State: ', arg);
      this.setState(arg.state);
    });
  }

  static pause() {
    console.log('ACTION: Pause the screen capture');
    ipcRenderer.send('pause-recording', { date: new Date() });
  }

  static stop() {
    console.log('ACTION: Stop and save the screen capture');
    ipcRenderer.send('stop-recording', { date: new Date() });
  }

  static toggleWebcam() {
    console.log('ACTION: Toggle the webcam');
    ipcRenderer.send('toggle-webcam', { date: new Date() });
  }

  cancel() {
    console.log('ACTION: Cancel the recording and reset');
    ipcRenderer.send('cancel-recording', { date: new Date() });
  }

  componentDidMount() {
    ipcRenderer.send('init-control-panel', { date: new Date() });
  }

  retrieveInputFromState(type) {
    const { inputState } = this.state;

    return inputState.length > 1 && inputState.filter(i => i.type === type)[0];
  }


  isInputActive({ type }) {
    switch (type) {
      case Constants.CAMERA_TYPE:
        return this.retrieveInputFromState(Constants.CAMERA_TYPE).active;
      case Constants.PAUSE_TYPE:
        return this.state.recordingPaused;
    }
  }

  render() {
    return (
      <div className='pg-controls'>
        <div className="c-control-panel">
          <ul className="c-control-list">
            <li className="c-control-item c-control-item--main" onClick={Controls.stop}>
              <div className="i-recorder">
                <div className="i-recorder__center"></div>
              </div>
            </li>
            <li className={`c-control-item ${this.isInputActive({ type: Constants.CAMERA_TYPE }) && "c-control-item--active"}`}
                onClick={Controls.toggleWebcam}>
              <VideoIcon/>
            </li>
            <li className={`c-control-item ${this.isInputActive({ type: Constants.MICROPHONE_TYPE }) && "c-control-item--active"}`}>
              <MicrophoneIcon />
            </li>
            <li className={`c-control-item ${this.isInputActive({ type: Constants.PAUSE_TYPE }) && "c-control-item--active"}`}
                onClick={Controls.pause}>
              <PauseIcon />
            </li>
            <li className="c-control-item" onClick={this.cancel}>
              <DeleteIcon />
            </li>
          </ul>
        </div>
      </div>
    );
  }
}
