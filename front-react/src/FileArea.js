import React from "react";
import './App.css';
import ConfirmationToSign from './ConfirmationToSign';
import crypto from  "crypto";

class  FileArea extends React.Component {
  render() {
    return (
      <span>
        <p className="App-file-area">
          <input type="file" onChange={this.handleFileChange.bind(this)} />
          &nbsp;
          <button onClick={this.handleSign.bind(this)} >署名する</button>
        </p>
        <p className="App-hash-value">
          {this.getFileHashView()}&nbsp;
        </p>
        <ConfirmationToSign
          visible={this.state.confirmationToSignVisible}
          onClosing={this.handleConfirmationClosing.bind(this)}
          signerMailAddress={this.props.signerMailAddress}
          fileHash={this.state.fileHash}/>
      </span>
    );
  }

  constructor() {
    super();
    this.state = {
      fileHash: "",
      confirmationToSignVisible: false,
    };
    this.reader = new FileReader();
    this.hashFunction = "SHA256";
  }

  handleFileChange(event) {
    const  selectedFile = event.target.files[0];

    this.readAsArrayBuffer(selectedFile, () => {
      const  selectedFileContents = this.reader.result;
      const  hashCalculator = crypto.createHash( this.hashFunction );
      hashCalculator.update(new Buffer( selectedFileContents ));
      const  hashValue = hashCalculator.digest("hex");

      this.setState({fileHash: hashValue});
    });
  }

  handleSign() {
    this.setState({confirmationToSignVisible: true});
  }

  handleConfirmationClosing() {
    this.setState({confirmationToSignVisible: false});
  }

  readAsArrayBuffer(file, callbackFunction) {
    this.reader.addEventListener('load', callbackFunction);
    this.reader.readAsArrayBuffer(file);
  }

  getFileHashView() {
    if (this.state.fileHash === "") {
      return  "";
    } else {
      return  this.hashFunction +" ハッシュ値：" + this.state.fileHash;
    }
  }
}
export default FileArea;
