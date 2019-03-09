import React, { Component } from 'react';
import { Button, Input, Jumbotron,  InputGroupAddon, InputGroup } from "reactstrap";
import store from 'store';
import { Redirect } from 'react-router'
import Header from '../Header.js';


class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      password: '',
    };
    this.login = this.login.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
  }
  componentDidMount(){
    document.title = "Sustainable Materials Advisor";
    store.set('correctpassword', 'uiucpassword' );
  }
  login(){
    store.set('password', this.state.password );
    if(this.state.password !== store.get('correctpassword')) {
      alert('wrong password');
      this.setState({ password: '' });
    }
    this.forceUpdate();
  }
  handleKeyPress(target){
    if (target.charCode === 13){
      this.login();
    }
  }
  render() {
    if(store.get('password') === store.get('correctpassword')){
      return (<Redirect to="/sustainability"/>);
    }else{
      return (
        <div>
          <Header/>
          <Jumbotron>
              <h1 className="display-3">Login</h1>
              <p className="lead">Enter Password:</p>
              <InputGroup>
                <Input type="password" name="password" id="password" placeholder="password" value={this.state.password} onChange={e => this.setState({ password: e.target.value })} onKeyPress={this.handleKeyPress}/>
                <InputGroupAddon addonType="append">
                  <Button onClick={this.login}>Log In</Button>
                </InputGroupAddon>
              </InputGroup>
          </Jumbotron>
        </div>
      );
    }
  }
};

export default Login;
