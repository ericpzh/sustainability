import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Home from './Home/Home.js';
import Header from './Header.js';
import './App.css';
import Favicon from 'react-favicon';
import favicon from './assets/favicon.ico'
class App extends Component {
  componentDidMount(){
    document.title = "Sustainable Materials Advisor";
  }

  render() {
    return (
      <div className="App">
        <Favicon url={favicon} />
        <Header/>
        <Home/>
      </div>
    );
  }
}

export default App;
