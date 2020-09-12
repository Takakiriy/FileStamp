import React from 'react';
import stamp from './stamp.svg';
import './App.css';
import FileArea from './FileArea';
import UserSetting from './UserSetting';

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
          <p className="App-small-text">
            「ファイルの選択」ボタンを押してファイルを選ぶか、<br/>
            「ファイルの選択」ボタンの上にファイルをドラッグ＆ドロップすると、<br/>
            現在の署名の状況が表示されます。
          </p>
          <p>
            Simple File Stamp version 0.03
          </p>
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
    };
  }

  handleUserSetting() {
    this.setState({userSettingVisible: true});
  }

  handleUserSettingClosing() {
    this.setState({userSettingVisible: false});
  }
}

export default App;
