import React, { Component } from 'react';

import Title from '../../components/Title/title.component';
import SourcesList from '../../components/Source/sources-list.component';
import InputList from '../../components/Input/input-list.component';
import Button from '../../components/Button/button.component';
import VideoPlayer from '../../components/VideoPlayer/video-player.component';

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      recording: false,
    };
    this.toggleRecording.bind(this);
  }

  toggleRecording() {
    this.setState(state => ({
      recording: !state.recording,
    }));
  }

  render() {
    const { recording } = this.state;
    return (
      <div className="pg-home">
        <Title />
        <SourcesList />
        <InputList />
        <Button onClick={() => this.toggleRecording()} recording={recording} />
        <VideoPlayer recording={recording} />
      </div>
    );
  }
}
