import React, { Component } from 'react';

import Title from '../../components/Title/title.component';
import SourcesList from '../../components/Source/sources-list.component';
import InputList from '../../components/Input/input-list.component';
import Button from '../../components/Button/button.component';

export default class Home extends Component {
  render() {
    return (
      <div className="pg-home">
        <Title />
        <SourcesList />
        <InputList />
        <Button />
      </div>
    );
  }
}
