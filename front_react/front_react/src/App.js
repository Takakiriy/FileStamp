import React from 'react';
import stamp from './stamp.svg';
import './App.css';
import UserSetting from './UserSetting';
import FileArea from './FileArea';
import Manual from './Manual';
import Support from './Support';
import REST_API from './REST_API';
import { MyContext, MyContextValue } from './MyContext';

class  App extends React.Component {
  render() {
    return (
      <MyContext.Provider  value={MyContextValue}>
        <div className="App">
          <div className="header-menu" data-test="user-info" data-toggle="modal" data-target="#user-modal">
            {this.getTestModeView()}ユーザー情報
          </div>
          <br/>
          <div className="main">
            <img src={stamp} className="App-logo" alt="logo" />
            <br/><br/>
            <FileArea signerMailAddress={this.state.userMailAddress}/>
          </div>
          <br/>
          <div className="footer">
            <h3>
              Simple File Stamp
            </h3>
            <small> version 0.11（開発中）</small>
          </div>
          <UserSetting
            mailAddress={this.state.userMailAddress}/>
        </div>
        <Manual/>
        <Support/>
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
    const isExampleComUser = (queryParameters.has("mail") && queryParameters.get("mail").endsWith("@example.com"));

    this.state = {
      html: "",
      userMailAddress: (queryParameters.has("mail") ? queryParameters.get("mail") : "unknown@example.com"),
      testMessage: "",
      isTestMode: isExampleComUser || window.location.hostname === 'localhost',
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
