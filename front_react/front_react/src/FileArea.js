import React from "react";
import './App.css';
import ConfirmationToSign from './ConfirmationToSign';
import crypto from  "crypto";
import REST_API from './REST_API';
import { MyContextValue } from './MyContext';

class  FileArea extends React.Component {
  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-1 col-md-0  order-1 order-md-4"></div>
          <div style={{paddingTop: '20px'}} className="col-12 col-md-8  order-2 order-md-1">
            <input type="file" onChange={this.handleSelectingFileChanged.bind(this)}
              data-test="file-selector" disabled={this.state.busyMode}/>
          </div>
          <div className="col-1 col-md-0  order-3 order-md-5"></div>
          <div className="col-12  order-4 order-md-3" style={{color: 'grey'}}>
            <small>{this.getFileHashView()}&nbsp;</small>
          </div>
          <div style={{paddingTop: '20px'}} className="col-12 col-md-4  order-5 order-md-2">
            <button onClick={this.handleSign.bind(this)} disabled={this.getSignDisabled()} data-test="sign"
              data-toggle="modal" data-target="#sign-modal">署名する</button>
          </div>
        </div>
        <div className="row">
          <div className="col-12" style={{paddingTop: '20px'}}>
            {this.getSignaturesView()}
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            {this.getGuideView()}
          </div>
        </div>
        <div id="log"/>
        <ConfirmationToSign
          fileName={this.state.fileName}
          signerMailAddress={this.props.signerMailAddress}
          fileHash={this.state.fileHash}
          ref={this.refConfirmationToSign}
          onSigned={this.handleSigned.bind(this)}
          onRemovedSignature={this.handleRemovedSignature.bind(this)}/>
      </div>
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
        const  fileHash = hashCalculator.digest('hex');

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
          let signatures = {};
          if (MyContextValue.isTestMode) {
            const now = new Date();
            signatures['this-is-not-in-server1@example.com'] = {
              Signer: 'this-is-not-in-server1@example.com',
              Date: this.formatDateStringUTC(now),
              IsDeleted: false,
            }
            signatures[MyContextValue.userMailAddress] = {
              Signer: MyContextValue.userMailAddress,
              Date: this.formatDateStringUTC(now),
              IsDeleted: true,
            }
            signatures['this-is-not-in-server2@example.com'] = {
              Signer: 'this-is-not-in-server2@example.com',
              Date: this.formatDateStringUTC(now),
              IsDeleted: true,
            }
          }
          this.setState({
            errorMessage: String(err),
            signatures,
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
  }

  handleSigned() {
    const newSignatures = Object.assign({}, this.state.signatures);
    const now = new Date();

    const newSignature = {
      Signer: this.props.signerMailAddress,
      Date: this.formatDateStringUTC(now),
      IsDeleted: false,
    }

    newSignatures[this.props.signerMailAddress] = newSignature;

    this.setState({
      signatures: newSignatures,
    });
  }

  handleDeleteSignature() {
    this.refConfirmationToSign.current.reset("remove");
    this.setState({confirmationMode: true});
  }

  handleRemovedSignature() {
    const newSignatures = Object.assign({}, this.state.signatures);
    const now = new Date();

    newSignatures[this.props.signerMailAddress].IsDeleted = true;
    newSignatures[this.props.signerMailAddress].Date = this.formatDateStringUTC(now);

    this.setState({
      signatures: newSignatures,
    });
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
        <div>
        <div data-test="signed-user-list"><small>署名済ユーザー</small></div>
          {
            (Object.values(this.state.signatures).length === 0)
            ? "未署名"
            : Object.values(this.state.signatures).map((signature, i) => {
              let deleteButton = null;
              if (this.props.signerMailAddress === signature.Signer) {
                deleteButton = <span><button onClick={this.handleDeleteSignature.bind(this)}
                  data-test="delete-signature" disabled={signature.IsDeleted}
                  data-toggle="modal" data-target="#sign-modal">取り消し</button>
                  <span className="d-inline  d-md-none"><br/></span></span>;
              }
              let strikethroughLine = "";
              if (signature.IsDeleted) {
                strikethroughLine = " strikethrough-line";
              }

              return (<div className="container" key={i}>
                <div className={"d-md-inline  signer" + strikethroughLine} data-test={'signer-' + i}>
                  {signature.Signer}
                </div>
                <span className="d-none  d-md-inline">&nbsp; - &nbsp;</span>
                <div className={"d-md-inline  small  signed-date" + strikethroughLine} data-test={'date-' + i}>
                  {this.formatJapaneseDate(signature.Date+'Z')}
                </div>
                <span className="d-none  d-md-inline">&nbsp;</span>
                {deleteButton}
                <span className="d-inline  d-md-none"><br/></span>
              </div>);
            }).reverse()
          }
        </div>
      );
    }
  }

  getGuideView() {
    if (this.state.busyMode) {
      return <small>問い合わせ中…</small>;
    } else if (this.state.errorMessage) {
      return <p className="error-message">{this.state.errorMessage}</p>;
    } else {
      return ( this.state.fileName !== '' ? null :
        <small>
        「ファイルの選択」ボタンを押してファイルを選ぶか、<br/>
        「ファイルの選択」ボタンの上にファイルをドラッグ＆ドロップすると、<br/>
        現在の署名の状況が表示されます。
        </small>
      );
    }
  }

  formatJapaneseDate( date ) {
    return this.formatDate(date, 'YYYY年 M月 D日 hh:mm');
  }

  formatDateStringUTC( date ) {
    return this.formatDateUTC(date, 'YYYY-MM-DD hh:mm:ss');
  }

  formatDate( date, format ) {
    const weekday = ['日', '月', '火', '水', '木', '金', '土'];
    if (!format) {
        format = 'YYYY/MM/DD(WW) hh:mm:ss';
    }
    if (typeof date === 'string') {
      date = this.new_Date(date);
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

  formatDateUTC( date, format ) {
    const weekday = ['日', '月', '火', '水', '木', '金', '土'];
    if (!format) {
        format = 'YYYY/MM/DD(WW) hh:mm:ss';
    }
    if (typeof date === 'string') {
      date = this.new_Date(date + 'Z');
    }

    format = format.replace(/YYYY/, date.getUTCFullYear().toString() );
    format = format.replace(/MM/, ('0' + (date.getUTCMonth() + 1)).slice(-2));
    format = format.replace(/DD/, ('0' + date.getUTCDate()).slice(-2));
    format = format.replace(/M/, date.getUTCMonth() + 1);
    format = format.replace(/D/, date.getUTCDate());
    format = format.replace(/WW/, weekday[date.getUTCDay()]);
    format = format.replace(/hh/, ('0' + date.getUTCHours()).slice(-2));
    format = format.replace(/h/,  date.getUTCHours());
    format = format.replace(/mm/, ('0' + date.getUTCMinutes()).slice(-2));
    format = format.replace(/ss/, ('0' + date.getUTCSeconds()).slice(-2));
    return format;
  }

  new_Date( date ) {
    if (typeof date === 'string') {
      return new Date(date.replace(' ', 'T'));
      // from "2019-01-01 12:00" to "2019-01-01T12:00" for Safari only
    } else {
      return new Date(date);
    }
  }
}
export default FileArea;
