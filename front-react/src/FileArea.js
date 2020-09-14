import React from "react";
import './App.css';
import ConfirmationToSign from './ConfirmationToSign';
import crypto from  "crypto";

class  FileArea extends React.Component {
  render() {
    return (
      <span>
        <p className="App-file-area">
          <input className="file-selector" type="file" onChange={this.handleSelectingFileChanged.bind(this)} />
          &nbsp;
          <button onClick={this.handleSign.bind(this)} disabled={this.state.signDisabled}>署名する</button>
        </p>
        <p className="App-hash-value">
          {this.getFileHashView()}&nbsp;
        </p>
        {this.getSignatures()}
        {this.getGuide()}
        <ConfirmationToSign
          fileName={this.state.fileName}
          signerMailAddress={this.props.signerMailAddress}
          fileHash={this.state.fileHash}
          ref={this.refConfirmationToSign}
          visible={this.state.confirmationToSignVisible}
          onSigned={this.handleSigned.bind(this)}
          onRemovedSignature={this.handleRemovedSignature.bind(this)}
          onClosing={this.handleConfirmationClosing.bind(this)}/>
      </span>
    );
  }

  constructor() {
    super();
    this.state = {
      fileName: "",
      fileHash: "",
      signatures: [],
      confirmationToSignVisible: false,
      signDisabled: true,
    };
    this.refConfirmationToSign = React.createRef();
    this.reader = new FileReader();
    this.hashFunction = "SHA256";
  }

  handleSelectingFileChanged(event) {
    const  selectedFile = event.target.files[0];
    if (selectedFile) {

      this.readAsArrayBuffer(selectedFile, () => {
        const  selectedFileContents = this.reader.result;
        const  hashCalculator = crypto.createHash( this.hashFunction );
        hashCalculator.update(new Buffer( selectedFileContents ));
        const  hashValue = hashCalculator.digest("hex");
        const signatures = {
          "saburo-suzuki@example.com": "2020-09-10",
          "jiro-suzuki@example.com": "2020-09-11",
          // "taro-suzuki@example.com": "2020-09-12",
        };

        this.setState({
          fileName: selectedFile.name,
          fileHash: hashValue,
          signatures,
          signDisabled: this.props.signerMailAddress in signatures,
        });
      });
    } else {
      this.setState({
        fileName: "",
        fileHash: "",
        signatures: [],
        signDisabled: true,
      });
    }
  }

  handleSign() {
    this.refConfirmationToSign.current.reset("add");
    this.setState({confirmationToSignVisible: true});
  }

  handleSigned() {
    const newSignatures = Object.assign({}, this.state.signatures);
    newSignatures[this.props.signerMailAddress] = "2020-09-12";

    this.setState({signDisabled: true});
    this.setState({signatures: newSignatures});
  }

  handleRemovedSignature() {
    const newSignatures = Object.assign({}, this.state.signatures);
    delete newSignatures[this.props.signerMailAddress];

    this.setState({signDisabled: false});
    this.setState({signatures: newSignatures});
  }

  handleConfirmationClosing() {
    this.setState({confirmationToSignVisible: false});
  }

  handleDeleteSign() {
    this.refConfirmationToSign.current.reset("remove");
    this.setState({confirmationToSignVisible: true});
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

  getSignatures() {
    return ( this.state.signatures.length === 0 ? null :
      <span>
        <span className="font-size-small">署名済ユーザー</span><br/>
        {Object.keys(this.state.signatures).map((signature, i) => {
          if (this.props.signerMailAddress === signature) {
            return <span className="signed-user" key={i}>{signature}
              <button onClick={this.handleDeleteSign.bind(this)} >削除</button><br/></span>;
          } else {
            return <span className="signed-user" key={i}>{signature}<br/></span>;
          }
        }).reverse()}
      </span>
    );
  }

  getGuide() {
    return ( this.state.signatures.length !== 0 ? null :
      <p className="guide">
      「ファイルの選択」ボタンを押してファイルを選ぶか、<br/>
      「ファイルの選択」ボタンの上にファイルをドラッグ＆ドロップすると、<br/>
      現在の署名の状況が表示されます。
    </p>
    );
  }
}
export default FileArea;
