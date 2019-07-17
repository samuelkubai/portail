import { screen, ipcRenderer } from 'electron';
import React, { Component } from 'react';

import * as Constants from '../../utils/Constants';
import ApplicationList from '../../components/ApplicationList/application-list.component';
import Button from '../../components/Button/button.component';
import InputList from '../../components/Input/input-list.component';
import Nav from '../../components/Nav/nav.component';
import SourcesList from '../../components/Source/sources-list.component';
import Title from '../../components/Title/title.component';
import WindowList from '../../components/WindowsList/window-list.component';
import Director from '../../utils/Director';
import MicrophoneIcon from '../../icons/microphone.icon';
import VideoIcon from '../../icons/video.icon';

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentSource: 'desktop',
      recording: false,
      recordingPaused: false,
      selectedSource: null,
      sourceType: 'desktop',
      selectingSource: false,
      inputState: [
        {
          active: true,
          name: 'Microphone',
          icon: MicrophoneIcon,
          type: Constants.MICROPHONE_TYPE,
          options: [],
        },
        {
          active: true,
          name: 'Camera',
          icon: VideoIcon,
          type: Constants.CAMERA_TYPE,
          options: [
            {
              id: 'default',
              name: 'Default',
            },
          ]
        }
      ]
    };
    this.onBack.bind(this);
    this.selectSource.bind(this);
    this.shouldSelectSource.bind(this);
    this.renderHome.bind(this);
    this.renderSelectWindow.bind(this);
    this.toggleRecording.bind(this);
    this.triggerRecordingSwitch.bind(this);
    this.updateInputState.bind(this);
    this.retrieveInputFromState.bind(this);

    ipcRenderer.on('cancel-recording', () => {
      Director
        .instance
        .cancelRecording()
        .stopCamera()
        .stopControlPanel()
        .resetAndCleanup();
    });

    ipcRenderer.on('cropping-finished', (evt, arg) => {
      console.log('[Home Component Process] In the "cropping-finished" event:');
      console.log('Arguments: ', arg);
      const { selectedSource } = this.state;
      const { state: { area, start } } = arg;

      const updatedSource = Object.assign(
        selectedSource,
        {
          originalWorkArea: selectedSource.workArea,
          recorderArea: {
            x: start.inverted.x,
            y: start.inverted.y,
            height: area.height,
            width: area.width
          },
          workArea: {
            x: start.x + selectedSource.workArea.x,
            y: start.y + selectedSource.workArea.y,
            height: area.height,
            width: area.width
          }
        }
      );
      console.log(`Updated source => `, updatedSource);

      this.setState(state => {
        return Object.assign(state, { selectedSource: updatedSource });
      }, () => {
        ipcRenderer.send('deactivate-cropping');
        this.triggerRecordingSwitch();
      });
    });

    ipcRenderer.on('init-control-panel', () => {
      console.log('[Home Component Process] In the "init-control-panel" event:');
      console.log('State: ', { state: this.state });
      ipcRenderer.send('update-control-panel', { state: this.state });
    });

    ipcRenderer.on('pause-recording', () => {
      Director
        .instance
        .pauseRecording(() => {
          this.setState(state => {
            return Object.assign(state, { recordingPaused: !state.recordingPaused })
          }, () => {
            ipcRenderer.send('update-control-panel', { state: this.state });
          })
        });
    });

    ipcRenderer.on('stop-recording', () => {
      this.toggleRecording(() => {
        ipcRenderer.send('update-control-panel', { state: this.state });
      });
    });

    ipcRenderer.on('toggle-webcam', () => {
      Director
        .instance
        .toggleCamera(
          () => {
            this.updateInputState({
              type: Constants.CAMERA_TYPE,
              active: !this.retrieveInputFromState(Constants.CAMERA_TYPE).active
            }, () => {
              ipcRenderer.send('update-control-panel', { state: this.state });
            });
          }
        );
    });
  }

  onBack() {
    const { currentSource } = this.state;

    switch (currentSource) {
      case 'desktop':
        this.setState(state => Object.assign(state, { selectingSource: false }));
        break;
      case 'windows':
        this.setState(state => Object.assign(state, { currentSource: 'desktop' }));
        break;
      default:
    }
  }

  retrieveInputFromState(type) {
    const { inputState } = this.state;

    return inputState.filter(i => i.type === type)[0];
  }

  renderHome({ inputState, sourceType, recording}) {
    return (
      <div className="fragment">
        <SourcesList
          source={sourceType}
          onSelect={(source) => { this.selectSourceType(source); }}
        />
        <InputList inputs={inputState} onUpdate={(arg) => this.updateInputState(arg)} />
        <Button onClick={() => this.triggerRecordingSwitch()} recording={recording} />
      </div>
    );
  }

  renderSelectWindow() {
    return (
      <div className="fragment">
        <Nav title="Select Window" onBack={() => { this.onBack(); }} />
        <WindowList onSelect={(source) => { this.selectSource(source); }} />
      </div>
    );
  }

  shouldSelectSource() {
    const { selectedSource, sourceType } = this.state;

    if (selectedSource) {
      return false;
    }

    if (sourceType === 'desktop') {
      // Check if we have more that one source.
      return screen.getAllDisplays().length > 1;
    }

    return true;
  }

  selectSource(source) {
    console.log('Select the source', source);

    const { sourceType } = this.state;

    switch (sourceType) {
      case 'desktop':
        this.setState(state => (
          Object.assign(state, {
            selectedSource: source,
            selectingSource: false,
          })
        ), () => {
          this.triggerRecordingSwitch();
          console.log('Toggle recording: ', { state: this.state });
        });
        break;
      case 'custom':
        this.setState(state => (
          Object.assign(state, {
            selectedSource: source,
            selectingSource: false,
          })
        ), () => {
          this.triggerCropper();
          console.log('Trigger cropper: ', { state: this.state });
        });
        break;
      default:
    }
  }

  selectSourceType(source) {
    this.setState(state => Object.assign(state, { sourceType: source }));
  }

  toggleRecording(cb) {
    const { selectedSource, recording } = this.state;

    if (!recording) {
      Director
        .instance
        .defineArea(selectedSource)
        .registerOnCleanup(() => {
          this.setState(
            state => Object.assign(state, { recording: false, selectedSource: null }),
            () => {
              ipcRenderer.send('close-cropper');
              cb && cb();
            }
          );
        })
        .setupCamera(this.retrieveInputFromState(Constants.CAMERA_TYPE))
        .setupAudio(this.retrieveInputFromState(Constants.MICROPHONE_TYPE))
        .setupControlPanel()
        .setup(() => {
          this.setState(state => Object.assign(state, { recording: true }), () => { cb && cb(); });
        });
    } else {
      Director
        .instance
        .stopRecording()
        .stopCamera()
        .stopControlPanel()
        .resetAndCleanup();
    }
  }

  triggerCropper() {
    const { selectedSource } = this.state;

    Director
      .instance
      .defineArea(selectedSource)
      .selectArea();
  }

  triggerRecordingSwitch() {
    if (this.shouldSelectSource()) {
      this.setState(state => Object.assign(state, { selectingSource: true }));
    } else {
      this.toggleRecording();
    }
  }

  updateInputState({ type, active, choice, options }, cb) {
    console.log(`updateInputState(): type: ${type} active: ${active} choice ${choice}`);

    const { inputState } = this.state;

    const updatedInputState = inputState.map(s => {
      if (s.type === type) {
        const input = {};
        if (active !== undefined) input.active = active;
        if (choice !== undefined) input.choice = choice;
        if (options !== undefined) input.options = options;

        return Object.assign(s, input);
      }

      return s;
    });

    this.setState(state => {
      return Object.assign(state, { inputState: updatedInputState });
    }, () => {
      cb && cb();
    })
  }

  render() {
    const { inputState, recording, selectingSource, sourceType } = this.state;

    return (
      <div className="pg-home">
        <Title />
        {
          !selectingSource ?
            this.renderHome({ inputState, sourceType, recording }) :
            this.renderSelectWindow()
        }
      </div>
    );
  }
}
