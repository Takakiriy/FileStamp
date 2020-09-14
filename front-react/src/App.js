import React from 'react';
import stamp from './stamp.svg';
import './App.css';
import FileArea from './FileArea';
import UserSetting from './UserSetting';
import REST_API from './REST_API';

class  App extends React.Component {
  render() {
    return (
      <div className="App">
        <div className="header-menu" onClick={this.handleUserSetting.bind(this)}>ユーザー情報</div>
        <br/>
        <div className="main">
          <img src={stamp} className="App-logo" alt="logo" />
          <br/><br/>
          <FileArea signerMailAddress={this.state.userMailAddress}/>
        </div>
        <br/>
        <div className="footer">
          <p>
            Simple File Stamp version 0.04
          </p>
          <button onClick={this.handleTestAPI.bind(this)}>TestaAPI</button><br/>
          {this.state.testMessage}
        </div>
        <UserSetting
          visible={this.state.userSettingVisible}
          onClosing={this.handleUserSettingClosing.bind(this)}
          mailAddress={this.state.userMailAddress}/>
      </div>
    );
  }

  constructor() {
    super();
    this.state = {
      html: "",
      userSettingVisible: false,
      userMailAddress: "taro-suzuki@example.com",
      testMessage: "",
    };
  }

  componentDidMount() {
    REST_API.getToken()
    .then( () => {
    })
    .catch( (err) => {
      this.setState({testMessage: String(err)});
    });
  }

  handleUserSetting() {
    this.setState({userSettingVisible: true});
  }

  handleUserSettingClosing() {
    this.setState({userSettingVisible: false});
  }

  async handleTestAPI() {
    const result = await REST_API.getTest().catch( (err) => {
      this.setState({testMessage: String(err)});
    });
    if (result) {
      this.setState({testMessage: "成功: " + result});
    }
  }
}

export default App;
