// What do we setup during the launch
// 1. Whether we are showing the webcam or not
// 2. Whether to include sound or not
// 3. Show the control panel
// 4. Kick-off recording.
import * as Constants from './Constants';
import Screen from './Screen';
import Controls from './Controls';
import Recorder from './Recorder';

class Director {
  constructor() {
    this.area = null;
    this.onCleanup = [];
    this.recordingOptions = {
      [Constants.CAMERA_TYPE]: {},
      [Constants.MICROPHONE_TYPE]: {},
    };
  }

  cancelRecording() {
    Recorder.instance.cancelRecording();
    return this;
  }

  defineArea(selectedSource) {
    this.area = selectedSource;
    return this;
  }

  pauseRecording() {
    if (Recorder.instance.isRecording()) Recorder.instance.pauseRecording();
    else this.setup();
    return this;
  }

  registerOnCleanup(cb) {
    this.onCleanup.push(cb);
    return this;
  }

  resetAndCleanup() {
    // Do some cleanup here
    this.onCleanup.forEach((cb) => cb());
    return this;
  }

  setup(cb) {
    Recorder.instance.record(this.area, this.recordingOptions);
    cb && cb();
  }

  setupCamera({ active }) {
    this.recordingOptions[Constants.CAMERA_TYPE].active = active;
    if (active) Screen.createWebcamPlayer(this.area);
    return this;
  }

  setupAudio({ active }) {
    this.recordingOptions[Constants.MICROPHONE_TYPE].active = active;
    return this;
  }

  setupControlPanel() {
    Controls.launchControlsPanel(this.area);
    return this;
  }

  stopCamera() {
    Screen.closeWebcamPlayer();
    return this;
  }

  stopControlPanel() {
    Controls.closeControlsPanel();
    return this;
  }

  stopRecording() {
    Recorder.instance.stopRecording();
    return this;
  }

  toggleCamera() {
    if (Screen.isWebcamVisible()) {
      Screen.hideWebcamPlayer();
    } else {
      Screen.showWebcamPlayer(this.area);
    }
    return this;
  }

  toggleAudio() {}
}

export default (function() {
  let singleInstance = new Director();

  return {
    instance: singleInstance,
  };
})();
