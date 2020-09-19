import React from 'react';
import stamp from './stamp.svg';
import './App.css';
import FileArea from './FileArea';
import UserSetting from './UserSetting';
import REST_API from './REST_API';
import { MyContext, MyContextValue } from './MyContext';

class  App extends React.Component {
  render() {
    return (
      <MyContext.Provider  value={MyContextValue}>
        <div className="App">
          <div className="header-menu" onClick={this.handleUserSetting.bind(this)}>
            {this.getTestModeView()}ユーザー情報</div>
          <br/>
          <div className="main">
            <img src={stamp} className="App-logo" alt="logo" />
            <br/><br/>
            <FileArea signerMailAddress={this.state.userMailAddress}/>
          </div>
          <br/>
          <div className="footer">
            <p>
              Simple File Stamp<br/><span className="font-size-small"> version 0.07（開発中）</span>
            </p>
          </div>
          <UserSetting
            visible={this.state.userSettingVisible}
            onClosing={this.handleUserSettingClosing.bind(this)}
            mailAddress={this.state.userMailAddress}/>
        </div>
      </MyContext.Provider>
    );
/*
            <button onClick={this.handleTestAPI.bind(this)} data-test="test">TestAPI</button><br/>
            {this.state.testMessage}
*/
  }
  static contextType = MyContext;

  constructor() {
    super();
    const queryParameters = new URLSearchParams(window.location.search);

    this.state = {
      html: "",
      userSettingVisible: false,
      userMailAddress: (queryParameters.has("mail") ? queryParameters.get("mail") : "unknown@example.com"),
      testMessage: "",
      isTestMode: (queryParameters.has("mail") && queryParameters.get("mail").endsWith("@example.com")),
    };
    MyContextValue.isTestMode = this.state.isTestMode;
    MyContextValue.userMailAddress = this.state.userMailAddress;
  }

  componentDidMount() {
    REST_API.getToken()
    .then( (data) => {
      const authenticatedMailAddress = data[0].user_id;
      this.setState({userMailAddress: authenticatedMailAddress});
      MyContextValue.userMailAddress = authenticatedMailAddress;
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

  getTestModeView() {
    if (this.state.isTestMode) {
      return <span className="test-mode-view">Test Mode </span>;
    } else {
      return null;
    }
  }
}

export default App;
