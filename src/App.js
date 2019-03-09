import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Home from './Home/Home.js';
import Header from './Common/Header.js';
import './App.css';
import Favicon from 'react-favicon';
import favicon from './assets/favicon.ico'
import Login from './Common/Login.js'
import store from 'store';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  componentDidMount(){
    document.title = "Sustainable Materials Advisor";
  }
  render() {
    if (store.get('password') === store.get('correctpassword') && typeof store.get('correctpassword') !== "undefined"){
      return(
        <div className="App">
          <Favicon url={favicon} />
          <Header/>
          <Home/>
        </div>
      );
    }else{
      return (
        <div>
          <Favicon url={favicon} />
          <Login/>
        </div>
      );
    }
  }
}

export default App;
