import React from "react";
import './Modal.css';
import REST_API from './REST_API';

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
                  <button onClick={this.handleDoButton.bind(this)}>{this.getDoButtonName()}</button>
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
      message: "no message",
      signButtonVisible: true,
    };
    this.state = Object.assign({}, this.resetState);
    this.operation = undefined;
    this.closeEnabled = true;
  }

  reset(operation) {
    this.setState(this.resetState);
    this.operation = operation;
    if (operation === "add") {
      this.setState({message: "ファイル（" + this.props.fileName + "）に対して貴方（" +
        this.props.signerMailAddress + "）の署名を追加します。"});
    } else {
      this.setState({message: "ファイル（" + this.props.fileName + "）に対する貴方（" +
        this.props.signerMailAddress + "）の署名を削除します。"});
    }
  }

  handleDoButton() {
    if (this.operation === "add") {
      this.handleSign();
    } else if (this.operation === "remove") {
      this.handleRemoveSignature();
    }
  }

  async handleSign() {
    this.setState({message: "署名中……"});
    this.closeEnabled = false;
    this.setState({signButtonVisible: false});
 
    const result = await REST_API.putFileHashSignatures(this.props.fileHash)
    .then( () => {
      this.setState({message: "署名しました。" + result});
      this.props.onSigned();
    })
    .catch( (err) => {
      this.setState({message: String(err)});
    })
    .finally( () => {
      this.closeEnabled = true;
    })
  }

  async handleRemoveSignature() {
    this.setState({message: "削除中……"});
    this.closeEnabled = false;
    this.setState({signButtonVisible: false});
 
    const result = await REST_API.putFileHashSignatures(this.props.fileHash)
    .then( () => {
      this.setState({message: "削除しました。" + result});
      this.props.onRemovedSignature();
    }).catch( (err) => {
      this.setState({message: String(err)});
    })
    .finally( () => {
      this.closeEnabled = true;
    })
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

  getDoButtonName() {
    if (this.operation === "add") {
      return "署名";
    } else if (this.operation === "remove") {
      return "削除";
    } else {
      return ""
    }
  }
}
export default ConfirmationToSign;
