import _ from 'lodash';
import { ipcRenderer } from 'electron';
import React, { Component } from 'react';

import * as Constants from '../../utils/Constants';
import ApplicationList from '../../components/ApplicationList/application-list.component';
import Button from '../../components/Button/button.component';
import InputList from '../../components/Input/input-list.component';
import Nav from '../../components/Nav/nav.component';
import Screen from '../../utils/Screen';
import SourcesList from '../../components/Source/sources-list.component';
import Title from '../../components/Title/title.component';
import WindowList from '../../components/WindowsList/window-list.component';
import VideoPlayer from '../../components/VideoPlayer/video-player.component';
import Controls from '../../utils/Controls';
import Director from '../../utils/Director';

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cancelRecording: false,
      selectingSource: false,
      currentSource: 'desktop',
      selectedSource: null,
      sourceType: 'desktop',
      recording: false,
      recordingPaused: false,
      inputState: [
        {
          type: 'microphone',
          active: true
        },
        {
          type: 'camera',
          active: true
        }
      ]
    };
    this.onBack.bind(this);
    this.selectSource.bind(this);
    this.shouldSelectSource.bind(this);
    this.renderHome.bind(this);
    this.renderSelectApp.bind(this);
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

    ipcRenderer.on('stop-recording', () => {
      this.toggleRecording();
    });

    ipcRenderer.on('pause-recording', () => {
      Director
        .instance
        .pauseRecording();
    });

    ipcRenderer.on('toggle-webcam', () => {
      Director.instance.toggleCamera();
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (!_.isEqual(prevState, this.state)) {

    }
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

  toggleRecording() {
    const { selectedSource, recording } = this.state;

    if (!recording) {
      Director
        .instance
        .defineArea(selectedSource)
        .registerOnCleanup(() => {
          this.setState(state => Object.assign(state, { recording: false, selectedSource: null }));
        })
        .setupCamera(this.retrieveInputFromState(Constants.CAMERA_TYPE))
        .setupAudio(this.retrieveInputFromState(Constants.MICROPHONE_TYPE))
        .setupControlPanel()
        .setup(() => {
          this.setState(state => Object.assign(state, { recording: true }));
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

  triggerRecordingSwitch() {
    if (this.shouldSelectSource()) {
      this.setState(state => Object.assign(state, { selectingSource: true }));
    } else {
      this.toggleRecording();
    }
  }

  shouldSelectSource() {
    const { selectedSource, sourceType } = this.state;

    if (selectedSource) {
      return false;
    }

    switch (sourceType) {
      case 'desktop':
        // TODO: Check if we have more that one source.
        return true;
      case 'windows':
        // TODO: Needs to select available applications.
        return true;
      default:
        return false;
    }
  }

  selectSource(source) {
    const { sourceType, currentSource } = this.state;

    switch (sourceType) {
      case 'desktop':
        this.setState(state => (
          Object.assign(state, {
            selectedSource: source,
            selectingSource: false,
          })
        ), () => {
          this.triggerRecordingSwitch();
          console.log('Toggle recording', { state: this.state });
        });
        break;
      case 'windows':
        if (currentSource === 'windows') {
          this.setState(state => (
            Object.assign(state, {
              selectedSource: source,
              selectingSource: false,
              currentSource: 'desktop',
            })
          ), () => {
            this.triggerRecordingSwitch();
            console.log('Toggle recording', { state: this.state });
          });
          break;
        }
        this.setState(state => (
          Object.assign(state, {
            currentSource: 'windows',
          })
        ));
        break;
      default:
    }

    console.log('Select the source', source);
  }

  selectSourceType(source) {
    this.setState(state => Object.assign(state, { sourceType: source }));
  }

  renderHome({ inputState, sourceType, recording}) {
    return (
      <div className="fragment">
        <SourcesList
          source={sourceType}
          onSelect={(source) => { this.selectSourceType(source); }}
        />
        <InputList inputState={inputState} onUpdate={(arg) => this.updateInputState(arg)} />
        <Button onClick={() => this.triggerRecordingSwitch()} recording={recording} />
      </div>
    );
  }

  renderSelectSource({ currentSource, sourceType }) {
    return (
      <div className="fragment">
        {
          (sourceType === 'desktop') ?
            this.renderSelectWindow() :
            (sourceType === 'windows' && currentSource === 'desktop') ?
              this.renderSelectWindow() :
              this.renderSelectApp()
        }
      </div>
    );
  }

  renderSelectApp() {
    return (
      <div className="fragment">
        <Nav title="Select App" onBack={() => { this.onBack(); }} />
        <ApplicationList onSelect={(source) => {this.selectSource(source)}} />
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

  onReset() {
    console.log('ACTION: Reset the application');
    this.toggleRecording();
  }

  updateInputState({ type, active }) {
    console.log(`updateInputState(): type: ${type} active: ${active}`);

    const { inputState } = this.state;

    const updatedInputState = inputState.map(s => {
      if (s.type === type) {
        return Object.assign(s, { active });
      }

      return s;
    });

    this.setState(state => {
      return Object.assign(state, { inputState: updatedInputState });
    })
  }

  render() {
    const { currentSource, inputState, recording, selectingSource, sourceType } = this.state;

    return (
      <div className="pg-home">
        <Title />
        {
          !selectingSource ?
            this.renderHome({ inputState, sourceType, recording }) :
            this.renderSelectSource({ currentSource, sourceType, selectingSource })
        }
      </div>
    );
  }
}
