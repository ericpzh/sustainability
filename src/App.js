import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Home from './Home/Home.js';
import Header from './Header.js';
import './App.css';
import Favicon from 'react-favicon';
import favicon from './assets/favicon.ico'
import Login from './Login/Login.js'
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
    //store.set('password', '' );
    if (store.get('password') !== store.get('correctpassword')){
      return(
        <div>
          <Login/>
        </div>
      );
    }else{
      return (
        <div className="App">
          <Favicon url={favicon} />
          <Header/>
          <Home/>
        </div>
      );
    }
  }
}

export default App;
