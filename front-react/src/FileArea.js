import React from "react";
import './App.css';
import crypto from  "crypto";

class  FileArea extends React.Component {
  render() {
    return (
      <div>
        <p className="App-file-area">
          <select className="dropdown" name="operation">
          <option value="確認"> 確認 </option>
          <option value="署名"> 署名 </option>
          </select> : &nbsp;
          <input type="file" onChange={this.handleFileChange.bind(this)} />
        </p>
        <p className="App-hash-value">
          {this.getFileHashView()}&nbsp;
        </p>
      </div>
    );
  }

  constructor() {
    super();
    this.state = {fileHash: ""};
    this.reader = new FileReader();
    this.hashFunction = "SHA256";
  }

  handleFileChange(ev) {
    const  selectedFile = ev.target.files[0];

    this.readAsArrayBuffer(selectedFile, () => {
      const  selectedFileContents = this.reader.result;
      const  hashCalculator = crypto.createHash( this.hashFunction );
      hashCalculator.update(new Buffer( selectedFileContents ));
      const  hashValue = hashCalculator.digest("hex");

      this.setState({fileHash: hashValue});
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
}
export default FileArea;
