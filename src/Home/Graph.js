import React, { Component } from 'react';
import { Label, Input, Button, Collapse, Navbar, NavbarToggler, NavbarBrand, Nav, NavItem, Modal, ModalHeader, ModalBody} from 'reactstrap';
import { Button as Button2 , Dropdown, Menu, Icon, Label as Label2, Divider, Table} from 'semantic-ui-react';
import Plot from 'react-plotly.js';
import './Home.css';
import calculateConvexHull from 'geo-convex-hull';
import * as math from 'mathjs';

const colorwheel = ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080'];

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
          xaxis: "Life Cycle Carbon Footprint(kg CO2 eq.)",
          yaxis: "LifeCycle ReCiPe Endpoints",
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
          vertical: false, //vertical layout of filter+result+options
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

      //build types assume small type2
      for (var i = 1; i < data.length ; i++){
        if (data[i]['Type2'] !== "" && ( i===0 || i>0 && data[i]['Type2'] !== data[i-1]['Type2'])){
          traces.push({
            x: [],
            y: [],
            text: [],
            type: 'scatter',
            mode: mode,
            name: data[i]['Type2'],
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
        if (data[i]['Type2'] !== "" &&  checked.includes(data[i]['Name']) && this.checkselected(data[i])){
          for (var j = 0; j < traces.length ; j++){
            if (traces[j]['name'] === data[i]['Type2']){
              var valid = this.isvalid(data[i]);
              if (valid){
                traces[j]['x'].push(valid.x);
                traces[j]['y'].push(valid.y);
                traces[j]['text'].push(data[i]['Name']);
              }
              break;
            }
          }
        }
      }

      var count = 0;
      for (var i = 0; i < traces.length ; i++){
        if (traces[i]['x'].length > 0){
          count ++;
        }
      }

      if(count >= colorwheel.length){//build types if large type2
        traces = [];
        if (typeof data !== "undefined" && data.length > 0){
          //build types
          for (var i = 1; i < data.length ; i++){
            if (data[i]['Type1'] !== "" && ( i===0 || i>0 && data[i]['Type1'] !== data[i-1]['Type1'])){
              traces.push({
                x: [],
                y: [],
                text: [],
                type: 'scatter',
                mode: mode,
                name: data[i]['Type1'],
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
            if (data[i]['Type1'] !== "" &&  checked.includes(data[i]['Name']) && this.checkselected(data[i])){
              for (var j = 0; j < traces.length ; j++){
                if (traces[j]['name'] === data[i]['Type1']){
                  var valid = this.isvalid(data[i]);
                  if (valid){
                    traces[j]['x'].push(valid.x);
                    traces[j]['y'].push(valid.y);
                    traces[j]['text'].push(data[i]['Name']);
                  }
                  break;
                }
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
          var x25 = parseFloat(math.quantileSeq(traces[i]['x'], 0.25));
          var x50 = parseFloat(math.quantileSeq(traces[i]['x'], 0.5));
          var x75 = parseFloat(math.quantileSeq(traces[i]['x'], 0.75));
          var y25 = parseFloat(math.quantileSeq(traces[i]['y'], 0.25));
          var y50 = parseFloat(math.quantileSeq(traces[i]['y'], 0.5));
          var y75 = parseFloat(math.quantileSeq(traces[i]['y'], 0.75));
          var shape = {
              type: 'circle',
              xref: 'x',
              yref: 'y',
              x0: parseFloat(x50-(x75-x25)),
              y0: parseFloat(y50-(y75-y25)),
              x1: parseFloat(x50+(x75-x25)),
              y1: parseFloat(y50+(y75-y25)),
              opacity: 0.5,
              fillcolor: traces[i]['marker']['color'],
              line: {
                  width: traces[i]['marker']['size']/3,
                  color: traces[i]['marker']['color'],
              },
          };
          //Count #points in the circle
          var count = 0;
          for (var k = 0; k < traces[i]['x'].length ; k++){
            var x = traces[i]['x'][k];
            var y = traces[i]['y'][k];
            if ((x-x50) <= x75-x25 && (y-y50) <= y75-y25){
              count ++;
            }
          }
          if (count > 0){
            shapes.push(shape);
          }
        }
      }
    }
    return shapes;
  }

  processResult(data,checked,col){//result modal data
      var result = "N/A";
      if (data.length > 0 && checked.length > 0){
        var ret = [];
        for (var i = 0; i < data.length ; i++){
          if (data[i]['Type'] !== "" &&  checked.includes(data[i]['Name']) && this.checkselected(data[i]) && this.isvalid(data[i])){
              ret.push({name:data[i]['Name'],value:data[i][col]});
          }
        }
        if (ret.length > 0){
          result = ret.sort(function(a, b){return a['value'] - b['value']})[0]['name'];
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
    if (this.props.checked.indexOf(data['Name']) > -1){
      return {x:data[this.state.xaxis],y:data[this.state.yaxis]};
    }
    return;
  }

  render() {
    return (
      <div className="Graph">
        <Modal isOpen={this.props.modal} toggle={this.props.modaltoggle} className={this.props.className}>
          <ModalHeader toggle={this.props.modaltoggle}>Best Material For:</ModalHeader>
          <ModalBody>
           <Table celled striped>
              <Table.Body>
                <Table.Row>
                  <Table.Cell>Material Carbon Footprint(kg CO2 eq.): </Table.Cell>
                  <Table.Cell>{this.processResult(this.props.data,this.props.checked,'Material Carbon Footprint(kg CO2 eq.)')}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>Processing Carbon Footprint(kg CO2 eq.): </Table.Cell>
                  <Table.Cell>{this.processResult(this.props.data,this.props.checked,'Processing Carbon Footprint(kg CO2 eq.)')}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>EoL Carbon Footprint(kg CO2 eq.): </Table.Cell>
                  <Table.Cell>{this.processResult(this.props.data,this.props.checked,'EoL Carbon Footprint(kg CO2 eq.)')}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>Life Cycle Carbon Footprint(kg CO2 eq.): </Table.Cell>
                  <Table.Cell>{this.processResult(this.props.data,this.props.checked,'Life Cycle Carbon Footprint(kg CO2 eq.)')}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>Total LifeCycle CED(MJ): </Table.Cell>
                  <Table.Cell>{this.processResult(this.props.data,this.props.checked,'Total LifeCycle CED(MJ)')}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>LifeCycle ReCiPe Human Health(DALY): </Table.Cell>
                  <Table.Cell>{this.processResult(this.props.data,this.props.checked,'LifeCycle ReCiPe Human Health(DALY)')}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>LifeCycle ReCiPe Ecotoxixity(species.year): </Table.Cell>
                  <Table.Cell>{this.processResult(this.props.data,this.props.checked,'LifeCycle ReCiPe Ecotoxixity(species.year)')}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>LifeCycle ReCiPe Resources Depletion($): </Table.Cell>
                  <Table.Cell>{this.processResult(this.props.data,this.props.checked,'LifeCycle ReCiPe Resources Depletion($)')}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>LifeCycle ReCiPe Endpoints: </Table.Cell>
                  <Table.Cell>{this.processResult(this.props.data,this.props.checked,'LifeCycle ReCiPe Endpoints')}</Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table>
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
                      {text:"Material Carbon Footprint(kg CO2 eq.)",value:"Material Carbon Footprint(kg CO2 eq.)"},
                      {text:"Processing Carbon Footprint(kg CO2 eq.)",value:"Processing Carbon Footprint(kg CO2 eq.)"},
                      {text:"EoL Carbon Footprint(kg CO2 eq.)",value:"EoL Carbon Footprint(kg CO2 eq.)"},
                      {text:"Life Cycle Carbon Footprint(kg CO2 eq.)",value:"Life Cycle Carbon Footprint(kg CO2 eq.)"},
                      {text:"Total LifeCycle CED(MJ)",value:"Total LifeCycle CED(MJ)"},
                      {text:"LifeCycle ReCiPe Human Health(DALY)",value:"LifeCycle ReCiPe Human Health(DALY)"},
                      {text:"LifeCycle ReCiPe Ecotoxixity(species.year)",value:"LifeCycle ReCiPe Ecotoxixity(species.year)"},
                      {text:"LifeCycle ReCiPe Resources Depletion($)",value:"LifeCycle ReCiPe Resources Depletion($)"},
                      {text:"LifeCycle ReCiPe Endpoints",value:"LifeCycle ReCiPe Endpoints"},
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
                      {text:"Material Carbon Footprint(kg CO2 eq.)",value:"Material Carbon Footprint(kg CO2 eq.)"},
                      {text:"Processing Carbon Footprint(kg CO2 eq.)",value:"Processing Carbon Footprint(kg CO2 eq.)"},
                      {text:"EoL Carbon Footprint(kg CO2 eq.)",value:"EoL Carbon Footprint(kg CO2 eq.)"},
                      {text:"Life Cycle Carbon Footprint(kg CO2 eq.)",value:"Life Cycle Carbon Footprint(kg CO2 eq.)"},
                      {text:"Total LifeCycle CED(MJ)",value:"Total LifeCycle CED(MJ)"},
                      {text:"LifeCycle ReCiPe Human Health(DALY)",value:"LifeCycle ReCiPe Human Health(DALY)"},
                      {text:"LifeCycle ReCiPe Ecotoxixity(species.year)",value:"LifeCycle ReCiPe Ecotoxixity(species.year)"},
                      {text:"LifeCycle ReCiPe Resources Depletion($)",value:"LifeCycle ReCiPe Resources Depletion($)"},
                      {text:"LifeCycle ReCiPe Endpoints",value:"LifeCycle ReCiPe Endpoints"},
                    ]}
                  />
                  </Menu>
              </div>

              <div className = "select-item">
                <Button2.Group fluid>
                  <Button2 active={!this.state.xlog}  onClick={()=>this.setState({xlog:false,xtype:''})}>X-axis: Normal</Button2>
                  <Button2.Or text="X"/>
                  <Button2 active={this.state.xlog}  onClick={()=>this.setState({xlog:true,xtype:'log',shapeoption:0})}>X-axis: Log</Button2>
                </Button2.Group>
              </div>
              <div className = "select-item">
                <Button2.Group fluid>
                  <Button2 active={!this.state.ylog}  onClick={()=>this.setState({ylog:false,ytype:''})}>Y-axis: Normal</Button2>
                  <Button2.Or text="Y"/>
                  <Button2 active={this.state.ylog}  onClick={()=>this.setState({ylog:true,ytype:'log',shapeoption:0})}>Y-axis: Log</Button2>
                </Button2.Group>
              </div>

              <div className = "select-item">
                <Button2.Group fluid>
                  <Button2 active={this.state.shapeoption===0} onClick={()=>this.setState({shapeoption:0})}>None</Button2>
                  <Button2.Or />
                  <Button2 active={this.state.shapeoption===1} onClick={()=>this.setState({shapeoption:1})}>Convex Hull</Button2>
                  <Button2.Or />
                  <Button2 active={this.state.shapeoption===2} onClick={()=>this.setState({shapeoption:2})} disabled={this.state.xlog || this.state.ylog}>Heat Map</Button2>
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
