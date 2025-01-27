import React, { Component } from 'react';
import { Collapse, Navbar, NavbarToggler, NavbarBrand, Nav, NavItem, NavLink} from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import logo from '../assets/john-deere-logo.png';
import '../App.css';
import store from 'store';
import { Redirect } from 'react-router'

class Header extends Component {
  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.logout = this.logout.bind(this);
    this.state = {
      isOpen: false,
      loggedout: false,
    };
  }
  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }
  logout(){
    store.set('password','');
    this.setState({loggedout:true});
  }
  render() {
    if (this.state.loggedout){
      return (<Redirect to="/sustainability"/>);
    }else{
      return (
        <div>
          <Navbar color="light" light expand="md">
            <NavbarBrand href="/sustainability"><img src = { logo } alt = '404' className = "header-logo"/></NavbarBrand>
            <NavbarToggler onClick={this.toggle} />
            <Collapse isOpen={this.state.isOpen} navbar>
              <Nav className="ml-auto" navbar>
                <NavItem>
                  <NavLink href="/sustainability">Sustainable Materials Advisor</NavLink>
                </NavItem>
                <NavItem>
                  <NavLink href="/sustainability/3d" >3D Plot</NavLink>
                </NavItem>
                <NavItem>
                  <NavLink href="/sustainability/Table" >Material List</NavLink>
                </NavItem>
                <NavItem>
                  <NavLink onClick = {this.logout} >Log out</NavLink>
                </NavItem>
              </Nav>
            </Collapse>
          </Navbar>
        </div>
      );
    }

  }
}

export default Header;
