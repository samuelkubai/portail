import React, { Component, PropTypes } from 'react';

import Screen from '../../utils/Screen';

export default class ApplicationList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      applications: [],
    };
    this.fetchApplications.bind(this);
  }

  componentDidMount() {
    this.fetchApplications();
  }

  fetchApplications() {
    Screen.getAllApplications((applications, error) => {
      if (!error) {
        this.setState(state => Object.assign(state, { applications }));
      }
    });
  }

  render() {
    const { onSelect } = this.props;
    const { applications } = this.state;

    return (
      <div className="c-window-list">
        { applications.map(application => (
          <div
            role="presentation"
            key={application.thumbnail.toDataURL()}
            className="c-window-list__window"
            onClick={() => { onSelect(application); }}
          >
            <img src={application.thumbnail.toDataURL()} alt={application.name} />
            <div className="c-window-list__name">
              {application.name}
            </div>
          </div>
        ))}
      </div>
    );
  }
}

ApplicationList.propTypes = {
  onSelect: PropTypes.func.isRequired,
};
