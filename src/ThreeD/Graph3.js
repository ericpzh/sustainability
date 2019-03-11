import React, { Component } from 'react';
import { Label, Input, Button, Collapse, Navbar, NavbarToggler, NavbarBrand, Nav, NavItem, Modal, ModalHeader, ModalBody} from 'reactstrap';
import Switch from "react-switch";
import Plot from 'react-plotly.js';
import './Home3.css';
const colorwheel = [
    '#1f77b4',  // muted blue
    '#ff7f0e',  // safety orange
    '#2ca02c',  // cooked asparagus green
    '#d62728',  // brick red
    '#9467bd',  // muted purple
    '#8c564b',  // chestnut brown
    '#e377c2',  // raspberry yogurt pink
    '#7f7f7f',  // middle gray
    '#bcbd22',  // curry yellow-green
    '#17becf'   // blue-teal
];


class Graph3 extends Component {
  constructor(props) {
      super(props);
      this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
      this.processData = this.processData.bind(this);
      this.processResult = this.processResult.bind(this);
      this.changex = this.changex.bind(this);
      this.changey = this.changey.bind(this);
      this.changez = this.changez.bind(this);
      this.massbasedchange = this.massbasedchange.bind(this);
      this.shownamechange = this.shownamechange.bind(this);
      this.xlogchange = this.xlogchange.bind(this);
      this.ylogchange = this.ylogchange.bind(this);
      this.zlogchange = this.zlogchange.bind(this);
      this.checkselected = this.checkselected.bind(this);
      this.toggleNavbar = this.toggleNavbar.bind(this);
      this.handleSelected = this.handleSelected.bind(this);
      this.isvalid = this.isvalid.bind(this);
      this.state = {
          xaxis: "Lifecycle Impacts",
          yaxis: "Cost",
          zaxis: "Material Impacts",
          width: window.innerWidth,
          height: window.innerHeight,
          massbased: true,
          showname: false,
          xlog: false,
          ylog: false,
          zlog: false,
          xtype: '',
          ytype: '',
          ztype:'',
          showlegend: true,
          collapsed: true,
      };
  }

  componentDidMount() {
    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }

  updateWindowDimensions() {
    if(window.innerWidth>925){
      this.setState({
        width: window.innerWidth,
        height: window.innerHeight,
        graphheight : 0.75 * window.innerHeight,
        graphwidth : 0.75 * window.innerWidth,
       });
    }else{
      this.setState({
        width: window.innerWidth,
        height: window.innerHeight,
        graphheight : 0.75 * window.innerHeight,
        graphwidth : 0.95 * window.innerWidth,
       });
    }
    if(window.innerWidth>700){
      this.setState({
        showlegend: true,
        collapsed: true,
      })
    }else{
      this.setState({
        showlegend: false,
        collapsed: true,
      })
    }
  }

  toggleNavbar() {
    var collapsed = this.state.collapsed;
    if (collapsed){
      this.setState({
        graphheight : 0.45 * window.innerHeight,
       });
    }else{
      this.setState({
        graphheight : 0.75 * window.innerHeight,
       });
    }
    this.setState({
      collapsed: !this.state.collapsed
    });
  }

  changex(event){
    this.setState({xaxis: event.target.value})
  }

  changey(event){
    this.setState({yaxis: event.target.value})
  }
  changez(event){
    this.setState({zaxis: event.target.value})
  }

  massbasedchange(massbased) {
    this.setState({ massbased });
  }

  shownamechange(showname){
    this.setState({ showname });
  }

  xlogchange(xlog) {
    this.setState({ xlog });
    if (xlog){
      this.setState({ xtype : 'log' });
    }else{
      this.setState({ xtype : '' });

    }
  }
  ylogchange(ylog) {
    this.setState({ ylog });
    if (ylog){
      this.setState({ ytype : 'log' });
    }else{
      this.setState({ ytype : '' });
    }
  }
  zlogchange(zlog) {
    this.setState({ zlog });
    if (zlog){
      this.setState({ ztype : 'log' });
    }else{
      this.setState({ ztype : '' });
    }
  }

  processData(data,checked){
      var traces = [];
      var mode = 'markers';
      var coloridx = 0;
      if (this.state.showname){
        mode = 'markers+text';
      }
      var size = 0;
      if (this.state.width < 925){
        size = this.state.width * 0.015;
      }else{
        size = this.state.width * 0.005;
      }
      if (typeof data !== "undefined" && data.length > 0){
        //build types
        traces.push({
          x: [],
          y: [],
          z: [],
          text: [],
          type: 'scatter3d',
          mode: mode,
          name: data[0]['Type'],
          textposition: 'bottom center',
          marker: {
            size: size,
            color:colorwheel[coloridx]
          }
        },{
        alphahull: 0,
        opacity: 0.4,
        type: 'mesh3d',
        x: [],
        y: [],
        z: [],
        name: data[0]['Type'],
        color:colorwheel[coloridx]
        });
        for (var i = 1; i < data.length ; i++){
          if (data[i]['Type'] !== "" && data[i]['Type'] !== data[i-1]['Type']){
            coloridx ++;
            traces.push({
              x: [],
              y: [],
              z: [],
              text: [],
              type: 'scatter3d',
              mode: mode,
              name: data[i]['Type'],
              textposition: 'bottom center',
              marker: {
                size: size,
                color: colorwheel[(coloridx)%colorwheel.length]
              }
            },{
            alphahull: 0,
            opacity: 0.4,
            type: 'mesh3d',
            x: [],
            y: [],
            z: [],
            name: data[i]['Type'],
            color:colorwheel[(coloridx)%colorwheel.length]
            });      
          }
        }
        //build datas
        for (var i = 0; i < data.length ; i++){
          if (data[i]['Type'] !== "" &&  checked.includes(data[i]['Name']) && this.checkselected(data[i])){
            for (var j = 0; j < traces.length ; j++){
              if (traces[j]['name'] === data[i]['Type']){
                var valid = this.isvalid(data[i]);
                if (valid){
                  traces[j]['x'].push(valid.x);
                  traces[j]['y'].push(valid.y);
                  traces[j]['z'].push(valid.z);
                  traces[j+1]['x'].push(valid.x);
                  traces[j+1]['y'].push(valid.y);
                  traces[j+1]['z'].push(valid.z);
                }
                traces[j]['text'].push(data[i]['Name']);
                break;
              }
            }
          }
        }
      }
      return traces;
  }

  processResult(data,checked){
      var result= {MaterialMass:'',CostMass:'',DisposalMass:'',EoLMass:'',LCMass:'',MaterialVol:'',CostVol:'',DisposalVol:'',EoLVol:'',LCVol:''};
      if (data.length > 0 && checked.length > 0){
        var materialmass = [];
        var costmass = [];
        var disposalmass = [];
        var eolmass = [];
        var lcmass = [];
        var materialvol = [];
        var costvol = [];
        var disposalvol = [];
        var eolvol = [];
        var lcvol = [];
        for (var i = 0; i < data.length ; i++){
          if (data[i]['Type'] !== "" &&  checked.includes(data[i]['Name']) && this.checkselected(data[i]) && this.isvalid(data[i])){
            if (data[i]['Density'] !== 0){
              materialmass.push({name:data[i]['Name'],value:data[i]['Material Impacts']/data[i]['Density']});
              costmass.push({name:data[i]['Name'],value:data[i]['Cost']/data[i]['Density']});
              disposalmass.push({name:data[i]['Name'],value:data[i]['Disposal Impacts']/data[i]['Density']});
              eolmass.push({name:data[i]['Name'],value:data[i]['EoL potential']/data[i]['Density']});
              lcmass.push({name:data[i]['Name'],value:data[i]['Lifecycle Impacts']/data[i]['Density']})
            }
            materialvol.push({name:data[i]['Name'],value:data[i]['Material Impacts']});
            costvol.push({name:data[i]['Name'],value:data[i]['Cost']});
            disposalvol.push({name:data[i]['Name'],value:data[i]['Disposal Impacts']});
            eolvol.push({name:data[i]['Name'],value:data[i]['EoL potential']});
            lcvol.push({name:data[i]['Name'],value:data[i]['Lifecycle Impacts']})
          }
        }
        if (materialmass.length > 0){
          result['MaterialMass'] = materialmass.sort(function(a, b){return a['value'] - b['value']})[0]['name'];
        }
        if (costmass.length > 0){
          result['CostMass'] = costmass.sort(function(a, b){return a['value'] - b['value']})[0]['name'];
        }
        if (disposalmass.length > 0){
          result['DisposalMass'] = disposalmass.sort(function(a, b){return a['value'] - b['value']})[0]['name'];
        }
        if (eolmass.length > 0){
          result['EoLMass'] = eolmass.sort(function(a, b){return a['value'] - b['value']})[0]['name'];
        }
        if (lcmass.length > 0){
          result['LCMass'] = lcmass.sort(function(a, b){return a['value'] - b['value']})[0]['name'];
        }
        if (materialvol.length > 0){
          result['MaterialVol'] = materialvol.sort(function(a, b){return a['value'] - b['value']})[0]['name'];
        }
        if (costvol.length > 0){
          result['CostVol'] = costvol.sort(function(a, b){return a['value'] - b['value']})[0]['name'];
        }
        if (disposalvol.length > 0){
          result['DisposalVol'] = disposalvol.sort(function(a, b){return a['value'] - b['value']})[0]['name'];
        }
        if (eolvol.length > 0){
          result['EoLVol'] = eolvol.sort(function(a, b){return a['value'] - b['value']})[0]['name'];
        }
        if (lcvol.length > 0){
          result['LCVol'] = lcvol.sort(function(a, b){return a['value'] - b['value']})[0]['name'];
        }
      }
      return result;
  }

  checkselected(obj){
      var selected = this.props.selected;
      for (var i = 0; i < selected.length ; i++){
        if (obj[selected[i]] == 0){
          return false;
        }
      }
      return true;
  }

  handleSelected(obj){
    var checked = [];
    var data = obj['points'];
    for (var i = 0; i < data.length ; i++){
      checked.push(data[i]['text']);
    }
    this.props.updatechecked(checked);
  }

  isvalid(data){
    if (this.state.massbased && data['Density'] !== 0){
      var x = data[this.state.xaxis]/data['Density'];
      var y = data[this.state.yaxis]/data['Density'];
      var z = data[this.state.zaxis]/data['Density'];
      if (this.props.checked.indexOf(data['Name']) > -1){
        return {x:x,y:y,z:z};
      }
    }else{
      var x = data[this.state.xaxis];
      var y = data[this.state.yaxis];
      var z = data[this.state.zaxis];
      if (this.props.checked.indexOf(data['Name']) > -1){
        return {x:x,y:y,z:z};
      }
    }
    return;
  }

  render() {
    return (
      <div className="Graph">
      <Modal isOpen={this.props.modal} toggle={this.props.modaltoggle} className={this.props.className}>
        <ModalHeader toggle={this.props.modaltoggle}>Best Material Optimize for:</ModalHeader>
        <ModalBody>
          <h2>Per Mass: </h2>
          <p>Material Impacts: {this.processResult(this.props.data,this.props.checked)['MaterialMass']}</p>
          <p>Cost: {this.processResult(this.props.data,this.props.checked)['CostMass']}</p>
          <p>Disposal Impacts: {this.processResult(this.props.data,this.props.checked)['DisposalMass']}</p>
          <p>EoL potential: {this.processResult(this.props.data,this.props.checked)['EoLMass']}</p>
          <p>Lifecycle Impacts: {this.processResult(this.props.data,this.props.checked)['LCMass']}</p>
          <h2>Per Volume: </h2>
          <p>Material Impacts: {this.processResult(this.props.data,this.props.checked)['MaterialVol']}</p>
          <p>Cost: {this.processResult(this.props.data,this.props.checked)['CostVol']}</p>
          <p>Disposal Impacts: {this.processResult(this.props.data,this.props.checked)['DisposalVol']}</p>
          <p>EoL potential: {this.processResult(this.props.data,this.props.checked)['EoLVol']}</p>
          <p>Lifecycle Impacts: {this.processResult(this.props.data,this.props.checked)['LCVol']}</p>
        </ModalBody>
      </Modal>
      <Navbar color="faded" light style = {{width: this.props.selectionwidth}}>
        <NavbarBrand href="/" className="mr-auto" disable="true"></NavbarBrand>
        <Button color = "secondary"  onClick={this.props.sidebartoggle} style={{margin:'0 0'}} active={this.props.sidebarOpen}>	&#9665; Filters</Button>
        <Button color = "secondary"  onClick={this.props.modaltoggle} style={{margin:'0 2.5%'}} active={this.props.modal}> Results</Button>
        <NavbarToggler onClick={this.toggleNavbar} className="mr-2" />
        <Collapse isOpen={!this.state.collapsed} navbar>
          <Nav navbar>
            <NavItem className = "selectcontainer">
              <div className = "select-axis">
                <Label for="exampleSelect" className = "select-axis-item">Select X axis:</Label>
                <Input type="select" placeholder="x axis" name="xselect" id="xSelect" className = "select-axis-item" value={this.state.xaxis} onChange={this.changex}>
                  <option>Lifecycle Impacts</option>
                  <option>Material Impacts</option>
                  <option>Cost</option>
                  <option>Disposal Impacts</option>
                  <option>EoL potential</option>
                </Input>
              </div>
              <div className = "select-switch">
                <Label for="exampleSelect" className = "select-switch-title">X-axis Scale</Label>
                <Label for="exampleSelect" className = "select-switch-front">Normal</Label>
                <Switch onChange={this.xlogchange} checked={this.state.xlog}  className = "select-switch-center" checkedIcon = {false} uncheckedIcon = {false}/>
                <Label for="exampleSelect" className = "select-switch-back">Log</Label>
              </div>

              <div className = "select-axis">
                <Label for="exampleSelect" className = "select-axis-item">Select Y axis:</Label>
                <Input type="select" placeholder="y axis" name="yselect" id="ySelect" className = "select-axis-item" value={this.state.yaxis} onChange={this.changey}>
                  <option>Lifecycle Impacts</option>
                  <option>Material Impacts</option>
                  <option>Cost</option>
                  <option>Disposal Impacts</option>
                  <option>EoL potential</option>
                </Input>
            </div>
            <div className = "select-switch">
              <Label for="exampleSelect" className = "select-switch-title">Y-axis Scale</Label>
              <Label for="exampleSelect" className = "select-switch-front">Normal</Label>
              <Switch onChange={this.ylogchange} checked={this.state.ylog}  className = "select-switch-center" checkedIcon = {false} uncheckedIcon = {false}/>
              <Label for="exampleSelect" className = "select-switch-back">Log</Label>
            </div>

            <div className = "select-axis">
              <Label for="exampleSelect" className = "select-axis-item">Select Z axis:</Label>
              <Input type="select" placeholder="z axis" name="zselect" id="zSelect" className = "select-axis-item" value={this.state.zaxis} onChange={this.changez}>
                <option>Lifecycle Impacts</option>
                <option>Material Impacts</option>
                <option>Cost</option>
                <option>Disposal Impacts</option>
                <option>EoL potential</option>
              </Input>
            </div>
            <div className = "select-switch">
              <Label for="exampleSelect" className = "select-switch-title">Z-axis Scale</Label>
              <Label for="exampleSelect" className = "select-switch-front">Normal</Label>
              <Switch onChange={this.zlogchange} checked={this.state.zlog}  className = "select-switch-center" checkedIcon = {false} uncheckedIcon = {false}/>
              <Label for="exampleSelect" className = "select-switch-back">Log</Label>
            </div>

            <div className = "select-switch">
              <Label for="exampleSelect" className = "select-switch-title">Display Methods</Label>
              <Label for="exampleSelect" className = "select-switch-front">Per Volume</Label>
              <Switch onChange={this.massbasedchange} checked={this.state.massbased}  className = "select-switch-center" checkedIcon = {false} uncheckedIcon = {false}/>
              <Label for="exampleSelect" className = "select-switch-back">Per Mass</Label>
            </div>
            <div className = "select-switch">
              <Label for="exampleSelect" className = "select-switch-title">Material Name</Label>
              <Label for="exampleSelect" className = "select-switch-front">Hide</Label>
              <Switch onChange={this.shownamechange} checked={this.state.showname}  className = "select-switch-center" checkedIcon = {false} uncheckedIcon = {false}/>
              <Label for="exampleSelect" className = "select-switch-back">Show</Label>
            </div>
          </NavItem>
        </Nav>
        </Collapse>
      </Navbar>

      <Plot
        data = {this.processData(this.props.data,this.props.checked)}
        layout = {{
          autosize: true,
          width: this.state.graphwidth,
          height:  this.state.graphheight,
          showlegend: this.state.showlegend,
          scene: {
              aspectratio: {
                  x: 1,
                  y: 1,
                  z: 1
              },
              camera: {
                  center: {
                      x: 0,
                      y: 0,
                      z: 0
                  },
                  eye: {
                      x: 1.25,
                      y: 1.25,
                      z: 1.25
                  },
                  up: {
                      x: 0,
                      y: 0,
                      z: 1
                  }
              },
              xaxis: {
                  zeroline: false,
                  title: {text: this.state.xaxis},
                  type: this.state.xtype,
                  backgroundcolor:"rgb(200, 200, 230)",
                  gridcolor:"rgb(255, 255, 255)",
                  showbackground:true,
                  zerolinecolor:"rgb(0, 0, 0)",
              },
              yaxis: {
                  zeroline: false,
                  title: {text: this.state.yaxis},
                  type: this.state.ytype,
                  backgroundcolor:"rgb(230, 200,230)",
                  gridcolor:"rgb(255, 255, 255)",
                  showbackground:true,
                  zerolinecolor:"rgb(0, 0, 0)",
              },
              zaxis: {
                  zeroline: false,
                  title: {text: this.state.zaxis},
                  type: this.state.ztype,
                  backgroundcolor:"rgb(230, 230,200)",
                  gridcolor:"rgb(255, 255, 255)",
                  showbackground:true,
                  zerolinecolor:"rgb(0, 0, 0)",
              }
          },
          font: {
            family: 'Lato',
            size: 16,
            color: 'rgb(100,150,200)'
          }
        }}
      />
      </div>
    );
  }
}

export default Graph3;
//onSelected = {(obj) => this.handleSelected(obj)}
