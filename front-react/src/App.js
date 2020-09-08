import React from 'react';
import stamp from './stamp.svg';
import './App.css';
import FileArea from './FileArea';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={stamp} className="App-logo" alt="logo" />
        <p>
          <React.StrictMode>
            <FileArea />
          </React.StrictMode>
        </p>
      Simple File Stamp version 0.01
      </header>
    </div>
  );
}

export default App;
