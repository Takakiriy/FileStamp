import React from "react";
import './Modal.css';
import REST_API from './REST_API';
import { MyContext } from './MyContext';

class  ConfirmationToSign extends React.Component {
  render() {
    return (
      <div className="modal fade" id="sign-modal" ref={this.signModal} tabIndex="-1" role="dialog"
           aria-labelledby="sign-modal-title" aria-hidden="true">
        <div className="modal-dialog  modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="sign-modal-title">電子署名</h5>
              <button type="button" className="close" ref={this.closeButton} data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true" data-test="close-confirmation">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <p data-test="guide">
                {this.state.message}
              </p>
              { this.state.signButtonVisible &&
                <p className="text-align-center">
                  <button onClick={this.handleDoButton.bind(this)} data-test="ok">{this.getDoButtonName()}</button>
                </p>
              }
            </div>
          </div>
        </div>
      </div>
    );
  }
  static contextType = MyContext;

  constructor() {
    super();
    this.resetState = {
      message: "no message",
      signButtonVisible: true,
    };
    this.state = Object.assign({}, this.resetState);
    this.operation = undefined;
    this.closeEnabled = true;
    this.signModal = React.createRef();
    this.closeButton = React.createRef();
  }

  componentDidMount() {
    window.$(this.signModal.current).on('hidden.bs.modal', () => {
      this.reset();
    });
  }

  reset(operation) {
    this.setState(this.resetState);
    this.operation = operation;
    if (operation === "add") {
      this.setState({message: "ファイル（" + this.props.fileName + "）に対して貴方（" +
        this.props.signerMailAddress + "）の署名を追加します。"});
    } else {
      this.setState({message: "ファイル（" + this.props.fileName + "）に対する貴方（" +
        this.props.signerMailAddress + "）の署名を取り消します。"});
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
    this.lockClose();
    this.setState({signButtonVisible: false});

    await REST_API.putFileHashSignatures(this.props.fileHash)
    .then( (result) => {
      this.setState({message: "署名しました。"});
      this.props.onSigned();
    })
    .catch( (err) => {
      this.setState({message: String(err)});
    })
    .finally( () => {
      this.unlockClose();
    })
  }

  async handleRemoveSignature() {
    this.setState({message: "取り消し中……"});
    this.lockClose();
    this.setState({signButtonVisible: false});

    await REST_API.deleteFileHashSignatures(this.props.fileHash)
    .then( (result) => {
      this.setState({message: "取り消しました。"});
      this.props.onRemovedSignature();
    }).catch( (err) => {
      this.setState({message: String(err)});
    })
    .finally( () => {
      this.unlockClose();
    })
  }

  lockClose() {
    this.closeEnabled = false;
    this.closeButton.current.classList.add('d-none');
    window.$(this.signModal.current).modal('lock');
  }

  unlockClose() {
    this.closeEnabled = true;
    this.closeButton.current.classList.remove('d-none');
    window.$(this.signModal.current).modal('unlock');
  }

  handleDefalut(event) {
    if (event.currentTarget !== event.target) { return }
    event.preventDefault();
  }

  getDoButtonName() {
    if (this.operation === "add") {
      return "署名";
    } else if (this.operation === "remove") {
      return "取り消し";
    } else {
      return ""
    }
  }
}
export default ConfirmationToSign;
