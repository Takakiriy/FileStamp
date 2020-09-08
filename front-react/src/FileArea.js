import React from "react";
import './App.css';

class  FileArea extends React.Component {
  render() {
    return (
      <span>
        <span>
          <select class="dropdown" name="operation" onChange={this.handleOperationChange.bind(this)}>
          <option value="確認"> 確認 </option>
          <option value="承認"> 承認 </option>
          </select> : &nbsp;
          <input type="file" onChange={this.handleFileChange.bind(this)} />
        </span><br/><br/>
        <span className="App-small-text">
        「ファイルの選択」ボタンを押してファイルを選ぶか、
        ファイルをボタンの上にドラッグ＆ドロップしてください。
        </span>
      </span>
    );
  }

  handleFileChange(ev) {
    const  files = ev.target.files
    console.log(files)
  }

  handleOperationChange(ev) {
  }
}
export default FileArea;
