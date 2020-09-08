import React from 'react';
import stamp from './stamp.svg';
import './App.css';
import FileArea from './FileArea';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={stamp} className="App-logo" alt="logo" />
        <br/><br/>
        <p>
          <React.StrictMode>
            <FileArea />
          </React.StrictMode>
        </p>
        <br/>
        <p className="App-small-text">
          「ファイルの選択」ボタンを押してファイルを選ぶか、
          ファイルをボタンの上にドラッグ＆ドロップしてください。
        </p>
        <p className="App-small-text">
          「確認」は、ファイルの内容を確認した人の一覧をサーバーから取得して表示します。<br/>
          「署名」は、ファイルの内容を本人が確認したことを証明する電子署名をサーバーに記録します。
        </p>
        <p>
          Simple File Stamp version 0.01
        </p>
      </header>
    </div>
  );
}

export default App;
