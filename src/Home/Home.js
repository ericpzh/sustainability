import React, { Component } from 'react';
import './Home.css';
import Filter from './Filter.js';
import Graph from './Graph.js';
import * as math from 'mathjs'
import { push as Menu } from 'react-burger-menu'

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
        data : [],
        checked: [],
        expanded: [],
        selected: [],
        sidebarOpen: false,
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
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
  }

  componentDidMount() {
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
      impacts.push(result.data[i]['Material Impacts']);
    }
    var impacts75th = math.quantileSeq(impacts, 0.75);
    var cost75th = math.quantileSeq(cost, 0.75);
    checked = [];
    for (var i = 0; i < result.data.length ; i++){
      if (result.data[i]['Material Impacts'] < 3 * impacts75th && result.data[i]['Cost'] < 3 * cost75th){
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

  render() {
    return (
      <div className="Home">
        <div id="outer-container">
          <Menu left width = {this.state.menuwidth} styles={{bmBurgerButton: {display: 'none'}, bmCrossButton: {display: 'none'}} } isOpen={this.state.sidebarOpen} onStateChange={ this.onSetSidebarOpen } disableOverlayClick={this.state.overlay} noOverlay={this.state.overlay} pageWrapId={ "page-wrap" } outerContainerId={ "outer-container" }>
            <div className="scroll">
            <Filter data = {this.state.data} checked = {this.state.checked} expanded = {this.state.expanded} onCheck = {this.onCheck} onExpand = {this.onExpand} selected = {this.state.selected} set = {this.setselected}/>
            </div>
          </Menu>
          <main id="page-wrap" style={{}}>
            <div className="scroll-fix">
              <Graph data = {this.state.data} checked = {this.state.checked} selected = {this.state.selected} sidebartoggle = {this.sidebartoggle} sidebarOpen = {this.state.sidebarOpen} selectionwidth = {this.state.selectionwidth}/>
            </div>
          </main>
        </div>
      </div>
    );
  }
}

export default Home;
