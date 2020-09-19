import React from "react";
import './App.css';
import ConfirmationToSign from './ConfirmationToSign';
import crypto from  "crypto";
import REST_API from './REST_API';

class  FileArea extends React.Component {
  render() {
    return (
      <span>
        <p className="App-file-area">
          <input className="file-selector" type="file" onChange={this.handleSelectingFileChanged.bind(this)} 
            data-test="file-selector" disabled={this.state.busyMode}/>
          &nbsp;
          <button onClick={this.handleSign.bind(this)} disabled={this.getSignDisabled()} data-test="sign">署名する</button>
        </p>
        <p className="App-hash-value">
          {this.getFileHashView()}&nbsp;
        </p>
        {this.getSignaturesView()}
        {this.getGuideView()}
        <ConfirmationToSign
          fileName={this.state.fileName}
          signerMailAddress={this.props.signerMailAddress}
          fileHash={this.state.fileHash}
          ref={this.refConfirmationToSign}
          visible={this.state.confirmationMode}
          onSigned={this.handleSigned.bind(this)}
          onRemovedSignature={this.handleRemovedSignature.bind(this)}
          onClosing={this.handleConfirmationClosing.bind(this)}/>
      </span>
    );
  }

  constructor() {
    super();
    this.state = {
      fileName: '',
      fileHash: '',
      signatures: {},
      errorMessage: null,
      busyMode: false,
      confirmationMode: false,
    };
    this.refConfirmationToSign = React.createRef();
    this.reader = new FileReader();
    this.hashFunction = 'SHA256';
  }

  handleSelectingFileChanged(event) {
    const  selectedFile = event.target.files[0];
    if (selectedFile) {

      this.readAsArrayBuffer(selectedFile, async () => {
        const  selectedFileContents = this.reader.result;
        const  hashCalculator = crypto.createHash( this.hashFunction );
        hashCalculator.update(new Buffer.from(selectedFileContents));
        const  fileHash_ = hashCalculator.digest('hex');

        this.setState({
          fileName: selectedFile.name,
          fileHash,
          signatures: {},
          busyMode: true,
        });

        await REST_API.getFileHashSignatures(fileHash)
        .then( (response) => {
          const  signatures = {};
          for ( const  signature  of  response.Signatures ) {
            signatures[signature.Signer] = signature;
          }

          this.setState({
            signatures,
          });
        })
        .catch( (err) => {
          this.setState({
            errorMessage: String(err),
          });
        })
        .finally( () => {
          this.setState({
            busyMode: false,
          });
        });
      });
    } else {
      this.setState({
        fileName: "",
        fileHash: "",
        signatures: {},
      });
    }
  }

  handleSign() {
    this.refConfirmationToSign.current.reset("add");
    this.setState({confirmationMode: true});
  }

  handleSigned() {
    const newSignatures = Object.assign({}, this.state.signatures);
    const now = new Date();
    const newSignature = {
      Signer: this.props.signerMailAddress,
      Date: this.formatDateString(now),
      IsDeleted: false,
    }

    newSignatures[this.props.signerMailAddress] = newSignature;

    this.setState({
      signatures: newSignatures,
    });
  }

  handleRemovedSignature() {
    const newSignatures = Object.assign({}, this.state.signatures);

    newSignatures[this.props.signerMailAddress].IsDeleted = true;

    this.setState({
      signatures: newSignatures,
    });
  }

  handleConfirmationClosing() {
    this.setState({confirmationMode: false});
  }

  handleDeleteSignature() {
    this.refConfirmationToSign.current.reset("remove");
    this.setState({confirmationMode: true});
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

  getSignDisabled() {
    let isSigned = false;
    if (this.props.signerMailAddress in this.state.signatures) {
      isSigned = ! this.state.signatures[this.props.signerMailAddress].IsDeleted;
    }

    return (
      this.state.fileName === ''  ||
      this.state.busyMode  ||
      isSigned );
  }

  getSignaturesView() {
    if (this.state.fileHash === ""  ||  this.state.busyMode) {
      return null;
    } else {
      return (
        <span>
          <span className="font-size-small" data-test="signed-user-list">署名済ユーザー</span><br/>
          {
            (Object.values(this.state.signatures).length === 0)
            ? "未署名"
            : Object.values(this.state.signatures).map((signature, i) => {
              let deleteButton = null;
              if (this.props.signerMailAddress === signature.Signer) {
                deleteButton = <button onClick={this.handleDeleteSignature.bind(this)}
                  data-test="delete-signature" disabled={signature.IsDeleted}>取り消し</button>;
              }
              let strikethroughLine = "";
              if (signature.IsDeleted) {
                strikethroughLine = " strikethrough-line";
              }

              return (<span key={i}>
                <span className={"signer" + strikethroughLine} data-test={'signer-' + i}>
                  {signature.Signer}
                </span>
                &nbsp;
                <span className={"signed-date" + strikethroughLine} data-test={'date-' + i}>
                  {this.formatJapaneseDate(signature.Date+'Z')}
                </span>
                &nbsp;
                {deleteButton}<br/>
              </span>);
            }).reverse()
          }
        </span>
      );
    }
  }

  getGuideView() {
    if (this.state.busyMode) {
      return <p className="guide">問い合わせ中…</p>;
    } else if (this.state.errorMessage) {
      return <p className="error-message">{this.state.errorMessage}</p>;
    } else {
      return ( this.state.fileName !== '' ? null :
        <p className="guide">
        「ファイルの選択」ボタンを押してファイルを選ぶか、<br/>
        「ファイルの選択」ボタンの上にファイルをドラッグ＆ドロップすると、<br/>
        現在の署名の状況が表示されます。
        </p>
      );
    }
  }

  formatJapaneseDate( date ) {
    return this.formatDate(date, 'YYYY年 M月 D日 hh:mm');
  }

  formatDateString( date ) {
    return this.formatDate(date, 'YYYY-MM-DD hh:mm:ss');
  }

  formatDate( date, format ) {
    const weekday = ['日', '月', '火', '水', '木', '金', '土'];
    if (!format) {
        format = 'YYYY/MM/DD(WW) hh:mm:ss';
    }
    if (typeof date === 'string') {
      date = new Date(date);
    }

    format = format.replace(/YYYY/, date.getFullYear().toString() );
    format = format.replace(/MM/, ('0' + (date.getMonth() + 1)).slice(-2));
    format = format.replace(/DD/, ('0' + date.getDate()).slice(-2));
    format = format.replace(/M/, date.getMonth() + 1);
    format = format.replace(/D/, date.getDate());
    format = format.replace(/WW/, weekday[date.getDay()]);
    format = format.replace(/hh/, ('0' + date.getHours()).slice(-2));
    format = format.replace(/h/,  date.getHours());
    format = format.replace(/mm/, ('0' + date.getMinutes()).slice(-2));
    format = format.replace(/ss/, ('0' + date.getSeconds()).slice(-2));
    return format;
  }
}
export default FileArea;
