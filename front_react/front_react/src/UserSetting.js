import React from "react";
import './Modal.css';

class  UserSetting extends React.Component {
  render() {
    return (
      <div className="modal fade" id="modal1" tabIndex="-1" role="dialog" aria-labelledby="modal1-title" aria-hidden="true">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="modal1-title">ユーザー情報</h5>
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true" data-test="close-user-info">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              メールアドレス:<br/>
                <input type="text" disabled value={this.props.mailAddress} data-test="user-mail-address" size="30"/>
                <br/><br/>
                <a href="/.auth/logout?post_logout_redirect_uri=/">サイン アウト</a>
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

  handleDefalut(event) {
    if (event.currentTarget !== event.target) { return }
    event.preventDefault();
  }
}
export default UserSetting;
