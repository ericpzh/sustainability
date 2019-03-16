import React, { Component } from 'react';
import { Label, Input, Button, Collapse, Navbar, NavbarToggler, NavbarBrand, Nav, NavItem, Modal, ModalHeader, ModalBody} from 'reactstrap';
import { Button as Button2 , Dropdown, Menu, Icon, Label as Label2, Divider} from 'semantic-ui-react';
import Plot from 'react-plotly.js';
import './Home.css';
import calculateConvexHull from 'geo-convex-hull';
import * as math from 'mathjs';

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


class Graph extends Component {
  constructor(props) {
      super(props);
      this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
      this.processData = this.processData.bind(this);
      this.processResult = this.processResult.bind(this);
      this.changex = this.changex.bind(this);
      this.changey = this.changey.bind(this);
      this.checkselected = this.checkselected.bind(this);
      this.toggleNavbar = this.toggleNavbar.bind(this);
      this.handleSelected = this.handleSelected.bind(this);
      this.addshapes = this.addshapes.bind(this);
      this.isvalid = this.isvalid.bind(this);
      this.state = {
          xaxis: "Lifecycle Impacts",
          yaxis: "Cost",
          width: window.innerWidth,
          height: window.innerHeight,
          massbased: true,
          showname: false,
          xlog: false,
          ylog: false,
          xtype: '',
          ytype: '',
          showlegend: true,
          collapsed: false,
          shapeoption: 0, //0:none, 1:convenHull, 2:big radius
          vertical: false,
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
        graphheight : 0.55 * window.innerHeight,
        graphwidth : 0.75 * window.innerWidth,
        vertical: false,
       });
    }else{
      this.setState({
        width: window.innerWidth,
        height: window.innerHeight,
        graphheight : 0.75 * window.innerHeight,
        graphwidth : 0.95 * window.innerWidth,
        vertical: true,
       });
    }
    if(window.innerWidth>700){
      this.setState({
        showlegend: true,
        collapsed: false,
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
        graphheight : 0.55 * window.innerHeight,
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

  processData(data,checked){//build scatter points
      var traces = [];
      var mode = 'markers';
      var coloridx = 0;
      if (this.state.showname){
        mode = 'markers+text';
      }
      var size = 0;
      if (this.state.width < 925){
        size = this.state.width * 0.01875;
      }else{
        size = this.state.width * 0.0075;
      }
      if (typeof data !== "undefined" && data.length > 0){
        //build types
        traces.push({
          x: [],
          y: [],
          text: [],
          type: 'scatter',
          mode: mode,
          name: data[0]['Type'],
          textposition: 'bottom center',
          marker: {
            size: size,
            color:colorwheel[coloridx]
          }
        });
        for (var i = 1; i < data.length ; i++){
          if (data[i]['Type'] !== "" && data[i]['Type'] !== data[i-1]['Type']){
            traces.push({
              x: [],
              y: [],
              text: [],
              type: 'scatter',
              mode: mode,
              name: data[i]['Type'],
              textposition: 'bottom center',
              marker: {
                size: size,
                color: colorwheel[(++coloridx)%colorwheel.length]
              }
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

  addshapes(traces){//calculate & apply backgroud shapes
    var shapes = [];
      for (var i = 0; i < traces.length ; i++){
        if(typeof traces[i] !== "undefined" && traces[i]['x'].length > 0 && traces[i]['y'].length > 0){
          var points = [];
          for (var j = 0; j < traces[i]['x'].length; j ++){
            points.push({
              latitude: traces[i]['x'][j],
              longitude: traces[i]['y'][j]
            })
          }
          if (this.state.shapeoption === 1){ //convex hull
            var convexHull = calculateConvexHull(points);
            if (traces[i]['x'].length === 1){//point
              var shape = {
                  type: 'rect',
                  xref: 'x',
                  yref: 'y',
                  x0: traces[i]['x'][0]-traces[i]['marker']['size']/3/15,
                  y0: traces[i]['y'][0]-traces[i]['marker']['size']/3/15,
                  x1: traces[i]['x'][0]+traces[i]['marker']['size']/3/15,
                  y1: traces[i]['y'][0]+traces[i]['marker']['size']/3/15,
                  opacity: 0.3,
                  fillcolor: traces[i]['marker']['color'],
                  line: {
                      width: traces[i]['marker']['size']/3,
                      color: traces[i]['marker']['color'],
                  },
              };
            }else if (traces[i]['x'].length === 2){//line
              var paths = [];
              var x0 = traces[i]['x'][0];
              var y0 = traces[i]['y'][0];
              var x1 = traces[i]['x'][1];
              var y1 = traces[i]['y'][1];
              var xm = (x1 + x0)/2;
              var ym = (y1 + y0)/2;
              var l = traces[i]['marker']['size']/3/5; //length
              if (y1 - y0 == 0){
                paths.push({
                  latitude: x0,
                  longitude: y0
                });
                paths.push({
                  latitude: xm,
                  longitude: ym-l
                });
                paths.push({
                  latitude: x1,
                  longitude: y1
                });
                paths.push({
                  latitude: xm,
                  longitude: ym+l
                });
              }else if(x1 - x0 == 0){
                paths.push({
                  latitude: x0,
                  longitude: y0
                });
                paths.push({
                  latitude: xm-l,
                  longitude: ym
                });
                paths.push({
                  latitude: x1,
                  longitude: y1
                });
                paths.push({
                  latitude: xm+l,
                  longitude: ym
                });
              }else{
                var slope = (y1 - y0)/(x1 - x0);
                var k = -1/slope;
                var x2 = l/Math.sqrt(k*k+1) + xm;
                var y2 = k*l/Math.sqrt(k*k+1) + ym;
                var x3 = -l/Math.sqrt(k*k+1) + xm;
                var y3 = -k*l/Math.sqrt(k*k+1) + ym;
                paths.push({
                  latitude: x0,
                  longitude: y0
                });
                paths.push({
                  latitude: x2,
                  longitude: y2
                });
                paths.push({
                  latitude: x1,
                  longitude: y1
                });
                paths.push({
                  latitude: x3,
                  longitude: y3
                });
              }
              var path = "M";
              for (var k = 0; k < paths.length ; k++){
                path += " " + (paths[k]['latitude']) + " " + (paths[k]['longitude']) +" "
                if(k < paths.length - 1){
                  path += "L"
                }
              }
              path += "Z"
              var shape = {
                  type: 'path',
                  path: path,
                  opacity: 0.3,
                  fillcolor: traces[i]['marker']['color'],
                  line: {
                      width: traces[i]['marker']['size']/3,
                      color: traces[i]['marker']['color'],
                  },
              };
            }else{//area
              var path = "M";
              for (var k = 0; k < convexHull.length ; k++){
                path += " " + (convexHull[k]['latitude']) + " " + (convexHull[k]['longitude']) +" "
                if(k < convexHull.length - 1){
                  path += "L"
                }
              }
              path += "Z"
              var shape = {
                  type: 'path',
                  path: path,
                  opacity: 0.3,
                  fillcolor: traces[i]['marker']['color'],
                  line: {
                      width: traces[i]['marker']['size']/3,
                      color: traces[i]['marker']['color'],
                  },
              };
            }
            shapes.push(shape);
        }else if(this.state.shapeoption === 2){//circle
          var x25 = math.quantileSeq(traces[i]['x'], 0.25);
          var x50 = math.quantileSeq(traces[i]['x'], 0.5);
          var x75 = math.quantileSeq(traces[i]['x'], 0.75);
          var y25 = math.quantileSeq(traces[i]['y'], 0.25);
          var y50 = math.quantileSeq(traces[i]['y'], 0.5);
          var y75 = math.quantileSeq(traces[i]['y'], 0.75);
          var shape = {
              type: 'circle',
              xref: 'x',
              yref: 'y',
              x0: x50-(x75-x25),
              y0: y50-(y75-y25),
              x1: x50+(x75-x25),
              y1: y50+(y75-y25),
              opacity: 0.5,
              fillcolor: traces[i]['marker']['color'],
              line: {
                  width: traces[i]['marker']['size']/3,
                  color: traces[i]['marker']['color'],
              },
          };
          shapes.push(shape);
        }
      }
    }
    return shapes;
  }

  processResult(data,checked){//result modal data
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

  checkselected(obj){// check preset filter
      var selected = this.props.selected;
      for (var i = 0; i < selected.length ; i++){
        if (obj[selected[i]] == 0){
          return false;
        }
      }
      return true;
  }

  handleSelected(obj){// update parent.state.chekced
    var checked = [];
    try{
      var data = obj['points'];
      for (var i = 0; i < data.length ; i++){
        checked.push(data[i]['text']);
      }
      this.props.updatechecked(checked);
    }
    catch(err) {
      console.log(err);
    }
  }

  isvalid(data){//check tree&range
    if (this.state.massbased && data['Density'] !== 0){
      var x = data[this.state.xaxis]/data['Density'];
      var y = data[this.state.yaxis]/data['Density'];
      if (this.props.checked.indexOf(data['Name']) > -1){
        return {x:x,y:y};
      }
    }else{
      var x = data[this.state.xaxis];
      var y = data[this.state.yaxis];
      if (this.props.checked.indexOf(data['Name']) > -1){
        return {x:x,y:y};
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
        <Button2.Group labeled icon vertical={this.state.vertical} fluid={this.state.vertical}>
          <Button2 content='Filters' icon='filter' labelPosition='left' onClick={this.props.sidebartoggle}  active={this.props.sidebarOpen} style={{margin:"1%"}}/>
          <Button2 content='Results' icon='calculator' labelPosition='left' onClick={this.props.modaltoggle}  active={this.props.modal} style={{margin:"1%"}}/>
          <Button2 content='Options' icon='options' labelPosition='left' onClick={this.toggleNavbar}  active={!this.state.collapsed} style={{margin:"1%"}}/>
        </Button2.Group>
        <Divider />
        <Navbar color="faded" light style = {{width: this.props.selectionwidth}}>
          <Collapse isOpen={!this.state.collapsed} navbar>
            <Nav navbar>
              <NavItem className = "selectcontainer">
                <div className = "select-item">
                <Menu fluid>
                  <Menu.Item header fluid>Select X-axis:</Menu.Item>
                  <Dropdown
                    placeholder='X-Axis'
                    value = {this.state.xaxis}
                    onChange = {(e, { value }) => this.setState({ xaxis: value })}
                    fluid
                    selection
                    options={[
                      {text:"Lifecycle Impacts(kgCO2-eq)",value:"Lifecycle Impacts"},
                      {text:"Material Impacts(kgCO2-eq)",value:"Material Impacts"},
                      {text:"Cost($)",value:"Cost"},
                      {text:"Disposal Impacts(kgCO2-eq)",value:"Disposal Impacts"},
                      {text:"EoL potential(kgCO2-eq)",value:"EoL potential"},
                    ]}
                  />
                </Menu>
                </div>
                <div className = "select-item">
                <Menu fluid>
                  <Menu.Item header fluid>Select Y-axis:</Menu.Item>
                  <Dropdown
                    placeholder='Y-Axis'
                    value = {this.state.yaxis}
                    onChange = {(e, { value }) => this.setState({ yaxis: value })}
                    fluid
                    selection
                    options={[
                      {text:"Lifecycle Impacts(kgCO2-eq)",value:"Lifecycle Impacts"},
                      {text:"Material Impacts(kgCO2-eq)",value:"Material Impacts"},
                      {text:"Cost($)",value:"Cost"},
                      {text:"Disposal Impacts(kgCO2-eq)",value:"Disposal Impacts"},
                      {text:"EoL potential(kgCO2-eq)",value:"EoL potential"},
                    ]}
                  />
                  </Menu>
              </div>

              <div className = "select-item">
                <Button2.Group fluid>
                  <Button2 active={!this.state.xlog}  onClick={()=>this.setState({xlog:false,xtype:''})}>X-axis: Normal</Button2>
                  <Button2.Or text="X"/>
                  <Button2 active={this.state.xlog}  onClick={()=>this.setState({xlog:true,xtype:'log'})}>X-axis: Log</Button2>
                </Button2.Group>
              </div>
              <div className = "select-item">
                <Button2.Group fluid>
                  <Button2 active={!this.state.ylog}  onClick={()=>this.setState({ylog:false,ytype:''})}>Y-axis: Normal</Button2>
                  <Button2.Or text="Y"/>
                  <Button2 active={this.state.ylog}  onClick={()=>this.setState({ylog:true,ytype:'log'})}>Y-axis: Log</Button2>
                </Button2.Group>
              </div>

              <div className = "select-item">
                <Button2.Group fluid>
                  <Button2 active={this.state.shapeoption===0} onClick={()=>this.setState({shapeoption:0})}>None</Button2>
                  <Button2.Or />
                  <Button2 active={this.state.shapeoption===1} onClick={()=>this.setState({shapeoption:1})}>Convex Hull</Button2>
                  <Button2.Or />
                  <Button2 active={this.state.shapeoption===2} onClick={()=>this.setState({shapeoption:2})}>Heat Map</Button2>
                </Button2.Group>
              </div>
              <div className = "select-item">
                <Button2.Group fluid>
                  <Button2 active={!this.state.showname} onClick={()=>this.setState({showname:false})}>Hide Name</Button2>
                  <Button2.Or />
                  <Button2 active={this.state.showname} onClick={()=>this.setState({showname:true})}>Display Name</Button2>
                </Button2.Group>
              </div>
            </NavItem>
          </Nav>
          </Collapse>
        </Navbar>

        <Plot
          onSelected = {(obj) => this.handleSelected(obj)}
          data = {this.processData(this.props.data,this.props.checked)}
          layout = {{
            shapes: this.addshapes(this.processData(this.props.data,this.props.checked)),
            autoresize : false,
            width: this.state.graphwidth,
            height:  this.state.graphheight,
            showlegend: this.state.showlegend,
            font: {
              family: 'Lato',
              size: 16,
              color: 'rgb(100,150,200)'
            },
            xaxis:{
              title: {text: this.state.xaxis},
              showgrid: true,
              zeroline: true,
              type:this.state.xtype,
              autorange: true,
            },
            yaxis:{
              title: {text: this.state.yaxis},
              showgrid: true,
              zeroline: true,
              type: this.state.ytype,
              autorange: true,
            },
          }}
        />
      </div>
    );
  }
}

export default Graph;
