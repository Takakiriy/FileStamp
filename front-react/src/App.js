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
          <FileArea
            signerMailAddress={this.state.userMailAddress}/>
          <p>
            <input type="button" onClick={this.handleButton.bind(this)} value="HTTP GET"/><br/>
            {this.state.html}
          </p>
        </div>
        <br/><br/>
        <div className="footer">
          <p className="App-small-text">
            「ファイルの選択」ボタンを押してファイルを選ぶか、
            ファイルをボタンの上にドラッグ＆ドロップしてください。
          </p>
          <p className="App-small-text">
            「確認」は、ファイルの内容を確認した人の一覧をサーバーから取得して表示します。<br/>
            「署名」は、ファイルの内容を本人が確認したことを証明する電子署名をサーバーに記録します。
          </p>
          <p>
            Simple File Stamp version 0.02
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

  async handleButton() {
    const result = await REST_API.getTest().catch( (err) => {
      this.setState({html: String(err)});
    });
    if (result) {
      this.setState({html: result});
    }
  }
}

export default App;
