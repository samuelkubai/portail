// What do we setup during the launch
// 1. Whether we are showing the webcam or not
// 2. Whether to include sound or not
// 3. Show the control panel
// 4. Kick-off recording.
import * as Constants from './Constants';
import Screen from './Screen';
import Cropper from './Cropper';
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

  pauseRecording(cb) {
    if (Recorder.instance.isRecording()) Recorder.instance.pauseRecording();
    else this.setup();

    cb && cb();

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

  selectArea() {
    console.log(`Director.instance.selectArea(): Launch cropper`);
    Cropper.launchCropper(this.area);
  }

  setup(cb) {
    Recorder.instance.record(this.area, this.recordingOptions).then((recording) => {
      console.log(`Director.instance.setup(): Successfully started recording`);
      console.log(recording);
      cb && cb();
    });
  }

  setupCamera({ active }) {
    this.recordingOptions[Constants.CAMERA_TYPE].active = active;
    if (active) Screen.createWebcamPlayer(this.area);
    return this;
  }

  setupAudio({ active, choice }) {
    this.recordingOptions[Constants.MICROPHONE_TYPE] = { active, choice };
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

  toggleCamera(cb) {
    if (Screen.isWebcamVisible()) {
      Screen.hideWebcamPlayer();
    } else {
      Screen.showWebcamPlayer(this.area);
    }

    cb && cb();

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
