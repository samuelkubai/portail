import React, { Component } from 'react';

export default class Webcam extends Component {
  constructor(props) {
    super(props);
    this.player = null;
    this.setPlayer = (element) => {
      this.player = element;
    };

    console.log(this.player);
  }

  componentDidMount() {
    const electron = require('electron')

    const display = electron.screen.getPrimaryDisplay() // http://electron.atom.io/docs/api/screen

    const constraints = {
      video: {
        width: {
          ideal: 200
        },
        height: {
          ideal: 200
        }
      }
    }

    window.navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      this.player.srcObject = stream  // Play stream in <video> element
    }).catch((error) => {
      console.error(error)
    })
  }

  render() {
    return (
      <div className="pg-webcam">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video autoPlay ref={this.setPlayer} />
      </div>
    );
  }
}
