import { ipcRenderer } from 'electron';
import React, { Component } from 'react';

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
import Recorder from '../../utils/Recorder';

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectingSource: false,
      currentSource: 'desktop',
      selectedSource: null,
      sourceType: 'desktop',
      recording: false,
    };
    this.onBack.bind(this);
    this.selectSource.bind(this);
    this.shouldSelectSource.bind(this);
    this.renderHome.bind(this);
    this.renderSelectApp.bind(this);
    this.renderSelectWindow.bind(this);
    this.toggleRecording.bind(this);
    this.triggerRecordingSwitch.bind(this);

    ipcRenderer.on('stop-recording', () => {
      this.toggleRecording();
    })
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

  toggleRecording() {
    const { selectedSource, recording } = this.state;

    if (!recording) {
      // Starting...
      // Register event listener
      Recorder.instance.addEventListener(this.toggleRecording);
      // Move the web camera to the correct screen
      Screen.createWebcamPlayer(selectedSource);
      // Setup the controls panel in the correct screen
      Controls.launchControlsPanel(selectedSource);
      // Start recording
      this.setState(state => Object.assign(state, { recording: true, }));
    } else {
      // Stopping...
      // Close the web camera player
      this.setState(
        state => Object.assign(state, { recording: false, }),
        () => {
          // Stop recording
          Screen.closeWebcamPlayer();
          // Close the controls panel
          Controls.closeControlsPanel();
          // Remove event listener
          Recorder.instance.removeListener(this.toggleRecording);
          // Update the state.
          this.setState(state => Object.assign(state, { selectedSource: null }));
        }
      );
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

  renderHome({ selectedSource, sourceType, recording }) {
    return (
      <div className="fragment">
        <SourcesList
          source={sourceType}
          onSelect={(source) => { this.selectSourceType(source); }}
        />
        <InputList />
        <Button onClick={() => this.triggerRecordingSwitch()} recording={recording} />
        <VideoPlayer recording={recording} source={selectedSource} />
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

  render() {
    const { currentSource, recording, selectedSource, selectingSource, sourceType } = this.state;
    return (
      <div className="pg-home">
        <Title />
        {
          !selectingSource ?
            this.renderHome({ selectedSource, sourceType, recording }) :
            this.renderSelectSource({ currentSource, sourceType, selectingSource })
        }
      </div>
    );
  }
}
