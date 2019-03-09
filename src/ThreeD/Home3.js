import React, { Component } from 'react';
import './Home3.css';
import Filter3 from './Filter3.js';
import Graph3 from './Graph3.js';
import * as math from 'mathjs';
import { push as Menu } from 'react-burger-menu';
import Header from '../Common/Header.js';
import Favicon from 'react-favicon';
import favicon from '../assets/favicon.ico'
import Login from '../Common/Login.js'
import store from 'store';

class Home3 extends Component {
  constructor(props) {
    super(props);
    this.state = {
        data : [],
        checked: [], //from tree
        expanded: [],
        selected: [], //from filters
        sidebarOpen: false,
        modal: false,
        width: window.innerWidth,
        height: window.innerHeight,
        overlay: true,
        selectionwidth: "100%",
        menuwidth: "25%",
    };
    this.onCheck = this.onCheck.bind(this);
    this.onExpand = this.onExpand.bind(this);
    this.initData = this.initData.bind(this);
    this.setselected = this.setselected.bind(this);
    this.sidebartoggle = this.sidebartoggle.bind(this);
    this.modaltoggle = this.modaltoggle.bind(this);
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    this.updatechecked = this.updatechecked.bind(this);
  }

  componentDidMount() {
    document.title = "Sustainable Materials Advisor";
    var csvFilePath = require("../assets/Granta.csv");
    var Papa = require("papaparse");
    Papa.parse(csvFilePath, {
      header: true,
      download: true,
      skipEmptyLines: true,
      complete: this.initData
    });
    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);
    if(window.innerWidth < 925){
      this.setState({
        sidebarOpen: false,
        selectionwidth:"100%",
        menuwidth:"75%",
        overlay : false,
      });
    }else{
      this.setState({
        menuwidth:"25%",
        overlay : true,
        sidebarOpen: true,
        selectionwidth:"75%",
      });
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }

  initData(result) {
    var checked = [];
    var expanded = ['All Material'];
    var impacts = [];
    var cost = [];
    const data = result.data;
    for (var i = 0; i < result.data.length ; i++){
      checked.push(result.data[i]['Name']);
      cost.push(result.data[i]['Cost']);
      impacts.push(result.data[i]['Lifecycle Impacts']);
    }
    var impacts75th = math.quantileSeq(impacts, 0.75);
    var cost75th = math.quantileSeq(cost, 0.75);
    checked = [];
    for (var i = 0; i < result.data.length ; i++){
      if (result.data[i]['Lifecycle Impacts'] < 3 * impacts75th && result.data[i]['Cost'] < 3 * cost75th){
        checked.push(result.data[i]['Name']);
      }
    }
    this.setState({
      data: data,
      checked: checked,
      expanded: expanded,
    });
  }

  setselected(selected) {
    const index = this.state.selected.indexOf(selected);
    if (index < 0) {
      this.state.selected.push(selected);
    } else {
      this.state.selected.splice(index, 1);
    }
    this.setState({ selected: [...this.state.selected] });
  }

  updateWindowDimensions() {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
    if(window.innerWidth < 925){
      this.setState({
        sidebarOpen: false,
        selectionwidth:"100%",
        menuwidth:"75%",
        overlay : false,
      });
    }else{
      this.setState({
        menuwidth:"25%",
        overlay : true,
        sidebarOpen: true,
        selectionwidth:"75%",
      });
      this.setState({
        sidebarOpen: false,
      });
    }
  }

  onCheck(checked) {
      this.setState({ checked });
  }

  onExpand(expanded) {
      this.setState({ expanded });
  }
  sidebartoggle() {
    this.setState({
      sidebarOpen: !this.state.sidebarOpen,
     });
  }

  modaltoggle() {
    if (this.state.modal == false){
      this.setState({
        sidebarOpen: false,
       });
    }
    this.setState(prevState => ({
      modal: !prevState.modal
    }));
  }

  updatechecked(checked){
    this.setState({
      checked: checked
    });
  }

  render() {
    if (store.get('password') === store.get('correctpassword') && typeof store.get('correctpassword') !== "undefined"){
      return(
        <div className="Home3">
          <Favicon url={favicon} />
          <Header/>
          <div id="outer-container">
            <Menu left width = {this.state.menuwidth} styles={{bmBurgerButton: {display: 'none'}, bmCrossButton: {display: 'none'}} } isOpen={this.state.sidebarOpen} onStateChange={ this.onSetSidebarOpen } disableOverlayClick={this.state.overlay} noOverlay={this.state.overlay} pageWrapId={ "page-wrap" } outerContainerId={ "outer-container" }>
              <div className="scroll">
              <Filter3 data = {this.state.data} checked = {this.state.checked} expanded = {this.state.expanded} onCheck = {this.onCheck} onExpand = {this.onExpand} selected = {this.state.selected} set = {this.setselected}/>
              </div>
            </Menu>
            <main id="page-wrap" style={{}}>
              <div className="scroll-fix">
                <Graph3 data = {this.state.data} checked = {this.state.checked} selected = {this.state.selected} sidebartoggle = {this.sidebartoggle} sidebarOpen = {this.state.sidebarOpen} selectionwidth = {this.state.selectionwidth} modal = {this.state.modal} modaltoggle = {this.modaltoggle} updatechecked = {this.updatechecked}/>
              </div>
            </main>
          </div>
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

export default Home3;
