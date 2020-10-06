import React from "react";
import './App.css';
import AnimationAlert from './AnimationAlert';
import REST_API from './REST_API';

class  Support extends React.Component {
  render() {
    return (
      <div className="container manual">
        <h2><span id="support" className="link-target">サポート</span></h2>

        <p>
          何かご質問があれば、下記のフォームに内容を入力して「送信内容の確認」ボタンを押してください。
        </p>

        <form ref={this.mailForm} noValidate>
          <div className="form-group">
            <label htmlFor="title1">タイトル</label>
            <input type="text" className="form-control" id="title1" placeholder="タイトルを入力"
              value={this.state.mailTitle} onChange={(e) => this.setState({mailTitle: e.target.value})}/>
          </div>
          <div className="form-group">
            <label htmlFor="name1">お名前</label>
            <input type="text" className="form-control" id="name1" placeholder="貴方のお名前を入力"
              value={this.state.mailName} onChange={(e) => this.setState({mailName: e.target.value})}/>
          </div>
          <div className="form-group">
            <label htmlFor="email1">返信を受け取るメールアドレス</label>
            <input type="email" className={this.getMailAdddressClass()} id="email1" aria-describedby="emailHelp" placeholder="貴方のメールアドレスを入力"
              value={this.state.mailAddress} onInput={(e) => this.setState({mailAddress: e.target.value})} onChange={()=>{}}/>
            <div className={this.getMailAdddressFeedbackClass()}>メールアドレスの書式が正しくありません</div>
          </div>
          <div className="form-group">
            <label htmlFor="textarea1">内容</label>
            <textarea className="form-control" id="textarea1" rows="7" placeholder="ご質問の内容を入力"
              value={this.state.mailContents} onChange={(e) => this.setState({mailContents: e.target.value})}/>
          </div>
          <AnimationAlert ref={this.alert}/>
          <div data-test="confirm-mail" onClick={this.handleConfirmMailButton.bind(this)} 
            className={this.getConfirmButtonClass()}>送信内容の確認</div>
        </form>

        <div className="modal fade" ref={this.mailModal} id="mail-modal" tabIndex="-1" role="dialog" aria-labelledby="mail-modal-title" aria-hidden="true">
          <div className="modal-dialog modal-xl" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="mail-modal-title">送信内容の確認</h5>
                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true" data-test="close-user-info">&times;</span>
                </button>
              </div>
              <div className="modal-body container">
                <form>
                  <div className="form-group">
                    <label htmlFor="mailTitle" className="text-secondary small">タイトル</label>
                    <div id="mailTitle" className="border p-2">{this.state.mailTitle}</div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="mailName" className="text-secondary small">お名前</label>
                    <div id="mailName" className="border p-2">{this.state.mailName}</div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="mailAddress" className="text-secondary small">返信を受け取るメールアドレス</label>
                    <div id="mailAddress" className="border p-2">{this.state.mailAddress}</div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="mailContents" className="text-secondary small">内容</label>
                    <div id="mailContents" className="border p-2">{this.getMultilineHTML(this.state.mailContents)}</div>
                  </div>
                  <div onClick={this.handleSendMailButton.bind(this)} data-test="send-mail" className="btn btn-primary">送信</div>
                </form>
              </div>
            </div>
          </div>
        </div>
        <div className="modal" id="waiting-modal" ref={this.waitingModal} tabIndex="-1" role="dialog"
            aria-labelledby="sign-modal-title" aria-hidden="true">
          <div className="modal-dialog  modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-body text-center">
                送信中...
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  constructor() {
    super();
    this.state = {
      mailTitle: "質問",
      mailName: "鈴木",
      mailAddress: "a@example.com",
      mailContents: "内容\nです",
    };
    this.mailForm = React.createRef();
    this.mailModal = React.createRef();
    this.waitingModal = React.createRef();
    this.alert = React.createRef();
  }

  handleConfirmMailButton(event) {
    if (this.isEnabedConfirm()) {
      window.$(this.mailModal.current).modal('show');
      this.alert.current.hideAlert();
    }
  }

  async handleSendMailButton() {
    this.lockClose();
    window.$(this.mailModal.current).modal('hide');
    window.$(this.waitingModal.current).modal('show');

    await REST_API.getFileHashSignatures(this.props.fileHash)
    .then( (result) => {
      this.alert.current.showAlert('送信しました');
    })
    .catch( (err) => {
      this.alert.current.showAlert(String(err), 'alert-danger', null);
    })
    .finally( () => {
      this.unlockClose();
      window.$(this.waitingModal.current).modal('hide');
    })
  }

  lockClose() {
    window.$(this.waitingModal.current).modal('lock');
  }

  unlockClose() {
    window.$(this.waitingModal.current).modal('unlock');
  }

  isEnabedConfirm() {
    return this.state.mailAddress && this.isValidMailAddress(this.state.mailAddress);
  }
  getMailAdddressClass() {
    return "form-control" + this.getValidatedInputClassName(this.isValidMailAddress(this.state.mailAddress));
  }
  getMailAdddressFeedbackClass() {
    return this.getFeedbackClassName(this.isValidMailAddress(this.state.mailAddress));
  }
  getConfirmButtonClass() {
    return "btn btn-secondary" + this.getDisabledClassName(!this.isEnabedConfirm());
  }
  getDisabledClassName(isDisabled) {
    if (isDisabled) {
      return " disabled";
    } else {
      return "";
    }
  }
  getFeedbackClassName(isValid) {
    if (isValid) {
      return " d-none";
    } else {
      return " invalid-feedback";
    }
  }
  getValidatedInputClassName(isValid) {
    if (isValid) {
      return "";
    } else {
      return " is-invalid";
    }
  }
  isValidMailAddress(address) {
    if (address) {
      var  addressExpression = /[\w\-\._]+@[\w\-\._]+\.[A-Za-z]+/;
      return addressExpression.test(address);
    } else {
      return true;
    }
  }
  getMultilineHTML(text) {
    return (
      <div>
        {text.split("\n").map((line, key) => {
            return <div key={key}>{line}</div>;
        })}
      </div>);
  }
}
export default Support;
