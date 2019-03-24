import React, { Component } from 'react';
import './Home3.css';
import Filter3 from './Filter3.js';
import Graph3 from './Graph3.js';
import * as math from 'mathjs';
import {Sidebar, Segment, Menu, Icon, Button, Dimmer, Loader  } from 'semantic-ui-react';
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
        loading: true,
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
    const styleLink = document.createElement("link");
    styleLink.rel = "stylesheet";
    styleLink.href = "https://cdn.jsdelivr.net/npm/semantic-ui/dist/semantic.min.css";
    document.head.appendChild(styleLink);
    var csvFilePath = require("../assets/Idematapp.csv");
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
        overlay : false,
      });
    }else{
      this.setState({
        overlay : true,
        sidebarOpen: true,
        selectionwidth:"80%",
      });
    }
    this.setState({loading:false});
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }

  initData(result) {//prepare checkboxtree + initial graph
    var checked = [];
    var expanded = ['All Material'];
    var x = [];
    var y = [];
    const data = result.data;
    for (var i = 0; i < result.data.length ; i++){
      x.push(result.data[i]['Life Cycle Carbon Footprint(kg CO2 eq.)']);
      y.push(result.data[i]['LifeCycle ReCiPe Endpoints']);
    }
    var x75 = math.quantileSeq(x, 0.75);
    var y75 = math.quantileSeq(y, 0.75);
    for (var i = 0; i < result.data.length ; i++){
      if (result.data[i]['Life Cycle Carbon Footprint(kg CO2 eq.)'] < 3 * x75 && result.data[i]['LifeCycle ReCiPe Endpoints'] < 3 * y75 && result.data[i]['Life Cycle Carbon Footprint(kg CO2 eq.)'] > 0 && result.data[i]['LifeCycle ReCiPe Endpoints'] > 0){
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
        overlay : false,
      });
    }else{
      this.setState({
        overlay : true,
        sidebarOpen: true,
        selectionwidth:"80%",
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
          <Segment>
            <Dimmer active={this.state.loading} inverted>
              <Loader inverted>Loading</Loader>
            </Dimmer>
            <Sidebar.Pushable as={Segment}>
              <Sidebar
                as={Menu}
                animation='slide along'
                direction='left'
                vertical
                width = "wide"
                visible={this.state.sidebarOpen}
              >
                <Menu.Item as='a'>
                  <div className="scroll">
                    <Button fluid onClick={()=>this.setState({sidebarOpen: false})}>Hide</Button>
                    <Filter3 data = {this.state.data} checked = {this.state.checked} expanded = {this.state.expanded} onCheck = {this.onCheck} onExpand = {this.onExpand} selected = {this.state.selected} set = {this.setselected}/>
                  </div>
                </Menu.Item>
              </Sidebar>
              <Sidebar.Pusher dimmed={!this.state.overlay && this.state.sidebarOpen}>
                <Segment basic>
                  <div className="scroll-fix">
                    <Graph3 data = {this.state.data} checked = {this.state.checked} selected = {this.state.selected} sidebartoggle = {this.sidebartoggle} sidebarOpen = {this.state.sidebarOpen} selectionwidth = {this.state.selectionwidth} modal = {this.state.modal} modaltoggle = {this.modaltoggle} updatechecked = {this.updatechecked}/>
                  </div>
                </Segment>
              </Sidebar.Pusher>
            </Sidebar.Pushable>
          </Segment>
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
