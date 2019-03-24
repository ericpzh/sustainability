import React, { Component } from 'react';
import { Label, Input, Button, Collapse, Navbar, NavbarToggler, NavbarBrand, Nav, NavItem, Modal, ModalHeader, ModalBody} from 'reactstrap';
import { Button as Button2 , Dropdown, Menu, Icon, Label as Label2, Divider, Table} from 'semantic-ui-react';
import Plot from 'react-plotly.js';
import './Home3.css';

const colorwheel = ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080'];

class Graph3 extends Component {
  constructor(props) {
      super(props);
      this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
      this.processData = this.processData.bind(this);
      this.processResult = this.processResult.bind(this);
      this.changex = this.changex.bind(this);
      this.changey = this.changey.bind(this);
      this.changez = this.changez.bind(this);
      this.checkselected = this.checkselected.bind(this);
      this.toggleNavbar = this.toggleNavbar.bind(this);
      this.handleSelected = this.handleSelected.bind(this);
      this.isvalid = this.isvalid.bind(this);
      this.state = {
          xaxis: "LifeCycle ReCiPe Endpoints",
          yaxis: "Total LifeCycle CED(MJ)",
          zaxis: "Life Cycle Carbon Footprint(kg CO2 eq.)",
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
          vertical: false, //vertical layout of filter+result+options
          shapeoption: 0, //0:none, 1: convexhull
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

      //convenHull or not
      var opacity = 0.4;
      if (this.state.shapeoption === 0){
        opacity = 0;
      }

      //build types assume small type2
      for (var i = 1; i < data.length ; i++){
        if (data[i]['Type2'] !== "" && ( i===0 || i>0 && data[i]['Type2'] !== data[i-1]['Type2'])){
          traces.push({
            x: [],
            y: [],
            z: [],
            text: [],
            type: 'scatter3d',
            mode: mode,
            name: data[i]['Type2'],
            textposition: 'bottom center',
            marker: {
              size: size,
              color: colorwheel[(++coloridx)%colorwheel.length]
            }
          },{
          alphahull: 0,
          opacity: opacity,
          type: 'mesh3d',
          x: [],
          y: [],
          z: [],
          name: data[i]['Type2'],
          color: colorwheel[(++coloridx)%colorwheel.length]
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
                traces[j]['z'].push(valid.z);
                traces[j+1]['x'].push(valid.x);
                traces[j+1]['y'].push(valid.y);
                traces[j+1]['z'].push(valid.z);
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
        for (var i = 1; i < data.length ; i++){
          if (data[i]['Type1'] !== "" && ( i===0 || i>0 && data[i]['Type1'] !== data[i-1]['Type1'])){
            traces.push({
              x: [],
              y: [],
              z: [],
              text: [],
              type: 'scatter3d',
              mode: mode,
              name: data[i]['Type1'],
              textposition: 'bottom center',
              marker: {
                size: size,
                color: colorwheel[(++coloridx)%colorwheel.length]
              }
            },{
            alphahull: 0,
            opacity: opacity,
            type: 'mesh3d',
            x: [],
            y: [],
            z: [],
            name: data[i]['Type1'],
            color: colorwheel[(++coloridx)%colorwheel.length]
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
                  traces[j]['z'].push(valid.z);
                  traces[j+1]['x'].push(valid.x);
                  traces[j+1]['y'].push(valid.y);
                  traces[j+1]['z'].push(valid.z);
                  traces[j]['text'].push(data[i]['Name']);
                }
                break;
              }
            }
          }
        }
      }
      return traces;
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

  checkselected(obj){
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
      return {x:data[this.state.xaxis],y:data[this.state.yaxis],z:data[this.state.zaxis]};
    }
    return;
  }

  render() {
    return (
      <div className="Graph3">
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
                <Button2.Group fluid>
                  <Button2 active={!this.state.xlog}  onClick={()=>this.setState({xlog:false,xtype:''})}>X-axis: Normal</Button2>
                  <Button2.Or text="X"/>
                  <Button2 active={this.state.xlog}  onClick={()=>this.setState({xlog:true,xtype:'log'})}>X-axis: Log</Button2>
                </Button2.Group>
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
                <Button2 active={!this.state.ylog}  onClick={()=>this.setState({ylog:false,ytype:''})}>Y-axis: Normal</Button2>
                <Button2.Or text="Y"/>
                <Button2 active={this.state.ylog}  onClick={()=>this.setState({ylog:true,ytype:'log'})}>Y-axis: Log</Button2>
              </Button2.Group>
            </div>

            <div className = "select-item">
              <Menu fluid>
                <Menu.Item header fluid>Select Z-axis:</Menu.Item>
                <Dropdown
                  placeholder='Z-Axis'
                  value = {this.state.zaxis}
                  onChange = {(e, { value }) => this.setState({ zaxis: value })}
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
                <Button2 active={!this.state.zlog}  onClick={()=>this.setState({zlog:false,ztype:''})}>Z-axis: Normal</Button2>
                <Button2.Or text="Z"/>
                <Button2 active={this.state.zlog}  onClick={()=>this.setState({zlog:true,ztype:'log'})}>Z-axis: Log</Button2>
              </Button2.Group>
            </div>

            <div className = "select-item">
              <Button2.Group fluid>
                <Button2 active={this.state.shapeoption===0} onClick={()=>this.setState({shapeoption:0})}>None</Button2>
                <Button2.Or />
                <Button2 active={this.state.shapeoption===1} onClick={()=>this.setState({shapeoption:1})}>Convex Hull</Button2>
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
