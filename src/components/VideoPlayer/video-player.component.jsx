import React, { Component, PropTypes } from 'react';
import Recorder from '../../utils/Recorder';

export default class VideoPlayer extends Component {
  constructor(props) {
    super(props);
    this.record.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (this.props.recording !== prevProps.recording) {
      // eslint-disable-next-line react/prop-types
      this.props.recording ?
        this.record() :
        VideoPlayer.stopRecording();
    }
  }

  static stopRecording() {
    Recorder.instance.stopRecording();
  }

  record() {
    const { source } = this.props;

    Recorder.instance.record(source);
  }

  render() {
    return (
      <div className="c-video-player" />
    );
  }
}

VideoPlayer.propTypes = {
  source: PropTypes.object,
  recording: PropTypes.bool.isRequired,
};

VideoPlayer.defaultProps = {
  source: {}
};
