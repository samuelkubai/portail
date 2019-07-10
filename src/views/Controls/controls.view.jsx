import { ipcRenderer } from 'electron';
import React, { Component } from 'react';

import Recorder from '../../utils/Recorder';
import DeleteIcon from '../../icons/delete.icon';
import PauseIcon from '../../icons/pause.icon';
import VideoIcon from '../../icons/video.icon';
import MicrophoneIcon from '../../icons/microphone.icon';

export default class Controls extends Component {
  constructor(props) {
    super(props);
    this.cancel.bind(this);
    this.record.bind(this);
  }

  static pause() {
    console.log('ACTION: Pause the screen capture');
    ipcRenderer.send('pause-recording', { date: new Date() });
  }

  static stop() {
    console.log('ACTION: Stop and save the screen capture');
    ipcRenderer.send('stop-recording', { date: new Date() });
  }

  record() {
    console.log('ACTION: Start the recording');
  }

  cancel() {
    console.log('ACTION: Cancel the recording and reset');
    ipcRenderer.send('cancel-recording', { date: new Date() });
  }

  static recordOrStop() {
    console.log('FORK: Decide whether to start or stop the recording');

    if (Recorder.instance.isRecording()) {
      Controls.stop();
    }
  }

  static toggleWebcam() {
    console.log('ACTION: Toggle the webcam');
    ipcRenderer.send('toggle-webcam', { date: new Date() });
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
            <li className="c-control-item" onClick={Controls.toggleWebcam}>
              <VideoIcon/>
            </li>
            <li className="c-control-item">
              <MicrophoneIcon />
            </li>
            <li className="c-control-item" onClick={Controls.pause}>
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
