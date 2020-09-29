import React from "react";
import './Modal.css';

class  UserSetting extends React.Component {
  render() {
    return (
      ! this.props.visible ? null :
      <div name="modal">
        <div className="modal-mask  text-align-right">
          <div className="vertical-align-middle  vertical-align-top" onClick={this.handleClose.bind(this)}>
            <div className="modal-window modal-window-user-setting" onClick={this.handleDefalut.bind(this)}>
              <button style={{float: "right"}} onClick={this.handleOK.bind(this)} data-test="close-user-info">
                Ⅹ
              </button>
              <div className="client-in-modal-window">
                メールアドレス:<br/>
                <input type="text" disabled value={this.props.mailAddress} data-test="user-mail-address" size="30"/>
                <br/><br/>
                <a href="/.auth/logout?post_logout_redirect_uri=/">サイン アウト</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
/*
              <p>
              名前:<br/>
              <input type="text" disabled value={this.state.name}
                onChange={(event) => this.setState({name: event.target.value})}/>
              </p><p>
              ユーザー登録日:<br/>
              <input type="text" disabled value={this.state.createDate}
                onChange={(event) => this.setState({createDate: event.target.value})}/>
              </p><p>
              補足:<br/>
              <input type="text" value={this.state.supplement}
                onChange={(event) => this.setState({supplement: event.target.value})}/>
              </p>
*/

  constructor() {
    super();
    this.state = {
      name: "鈴木太郎",
      createDate: "2020-09-12",
      supplement: "",
    };
  }

  handleOK() {
    this.close();
  }

  handleClose(event) {
    if (event.currentTarget !== event.target) { return }
    this.close();
  }

  close(event) {
    this.props.onClosing();
  }

  handleDefalut(event) {
    if (event.currentTarget !== event.target) { return }
    event.preventDefault();
  }
}
export default UserSetting;
