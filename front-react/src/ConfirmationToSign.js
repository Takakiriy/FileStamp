import React from "react";
import './Modal.css';

class  ConfirmationToSign extends React.Component {
  render() {
    return (
      ! this.props.visible ? null :
      <div name="modal">
        <div className="modal-mask">
          <div className="vertical-align-middle" onClick={this.handleClose.bind(this)}>
            <div className="modal-window" onClick={this.handleDefalut.bind(this)}>
              <div className="text-align-right">
                <button onClick={this.handleClose.bind(this)}>Ⅹ</button>
              </div>
              <p>
                {this.state.message}
              </p>
              { this.state.signButtonVisible &&
                <p className="text-align-center">
                  <button onClick={this.handleSign.bind(this)}>署名</button>
                </p>
              }
            </div>
          </div>
        </div>
      </div>
    );
  }

  constructor() {
    super();
    this.resetState = {
      message: "このファイルに対して貴方の署名を追加します。",
      signButtonVisible: true,
    };
    this.state = Object.assign({}, this.resetState);
    this.closeEnabled = true;
  }

  reset() {
    this.setState(this.resetState);
  }

  handleSign() {
    this.setState({message: "署名中……"});
    this.closeEnabled = false;
    this.setState({signButtonVisible: false});
    console.log("署名：" + this.props.signerMailAddress + " " + this.props.fileHash)
    setTimeout(() => {
      this.setState({message: "署名しました。"});
      this.closeEnabled = true;
    }, 1000)
  }

  handleClose(event) {
    if (event.currentTarget !== event.target) { return }
    this.close();
  }

  close(event) {
    if (!this.closeEnabled) {return;}
    this.reset();
    this.props.onClosing();
  }

  handleDefalut(event) {
    if (event.currentTarget !== event.target) { return }
    event.preventDefault();
  }
}
export default ConfirmationToSign;
