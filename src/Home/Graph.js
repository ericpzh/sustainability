import React, { Component } from 'react';
import { Label, Input, Button, Collapse, Navbar, NavbarToggler, NavbarBrand, Nav, NavItem, Modal, ModalHeader, ModalBody} from 'reactstrap';
import Switch from "react-switch";
import Plot from 'react-plotly.js';
import './Home.css';
import calculateConvexHull from 'geo-convex-hull';
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
      this.massbasedchange = this.massbasedchange.bind(this);
      this.shownamechange = this.shownamechange.bind(this);
      this.xlogchange = this.xlogchange.bind(this);
      this.ylogchange = this.ylogchange.bind(this);
      this.checkselected = this.checkselected.bind(this);
      this.toggleNavbar = this.toggleNavbar.bind(this);
      this.handleSelected = this.handleSelected.bind(this);
      this.addcircle = this.addcircle.bind(this);
      this.isvalid = this.isvalid.bind(this);
      this.state = {
          xaxis: "Material Impacts",
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
        graphheight : 0.45 * window.innerHeight,
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

  processData(data,checked){
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

  addcircle(traces){
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
        var convexHull = calculateConvexHull(points);
        if (convexHull.length === 1){//point
          var shape = {
              type: 'rect',
              xref: 'x',
              yref: 'y',
              x0: convexHull[0]['latitude']-traces[i]['marker']['size']/3/15,
              y0: convexHull[0]['longitude']-traces[i]['marker']['size']/3/15,
              x1: convexHull[0]['latitude']+traces[i]['marker']['size']/3/15,
              y1: convexHull[0]['longitude']+traces[i]['marker']['size']/3/15,
              opacity: 0.3,
              fillcolor: traces[i]['marker']['color'],
              line: {
                  width: traces[i]['marker']['size']/3,
                  color: traces[i]['marker']['color'],
              },
          };
        }else if (convexHull.length === 2){//line
          var shape = {
              type: 'rect',
              xref: 'x',
              yref: 'y',
              x0: convexHull[0]['latitude']-traces[i]['marker']['size']/3/15,
              y0: convexHull[0]['longitude']-traces[i]['marker']['size']/3/15,
              x1: convexHull[1]['latitude']+traces[i]['marker']['size']/3/15,
              y1: convexHull[1]['longitude']+traces[i]['marker']['size']/3/15,
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
      }
    }
    return shapes;
  }

  processResult(data,checked){
      var result= {MaterialMass:'',CostMass:'',DisposalMass:'',EoLMass:'',MaterialVol:'',CostVol:'',DisposalVol:'',EoLVol:''};
      if (data.length > 0 && checked.length > 0){
        var materialmass = [];
        var costmass = [];
        var disposalmass = [];
        var eolmass = [];
        var materialvol = [];
        var costvol = [];
        var disposalvol = [];
        var eolvol = [];
        for (var i = 0; i < data.length ; i++){
          if (data[i]['Type'] !== "" &&  checked.includes(data[i]['Name']) && this.checkselected(data[i]) && this.isvalid(data[i])){
            if (data[i]['Density'] !== 0){
              materialmass.push({name:data[i]['Name'],value:data[i]['Material Impacts']/data[i]['Density']});
              costmass.push({name:data[i]['Name'],value:data[i]['Cost']/data[i]['Density']});
              disposalmass.push({name:data[i]['Name'],value:data[i]['Disposal Impacts']/data[i]['Density']});
              eolmass.push({name:data[i]['Name'],value:data[i]['EoL potential']/data[i]['Density']});
            }
            materialvol.push({name:data[i]['Name'],value:data[i]['Material Impacts']});
            costvol.push({name:data[i]['Name'],value:data[i]['Cost']});
            disposalvol.push({name:data[i]['Name'],value:data[i]['Disposal Impacts']});
            eolvol.push({name:data[i]['Name'],value:data[i]['EoL potential']});
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
          <h2>Per Volume: </h2>
          <p>Material Impacts: {this.processResult(this.props.data,this.props.checked)['MaterialVol']}</p>
          <p>Cost: {this.processResult(this.props.data,this.props.checked)['CostVol']}</p>
          <p>Disposal Impacts: {this.processResult(this.props.data,this.props.checked)['DisposalVol']}</p>
          <p>EoL potential: {this.processResult(this.props.data,this.props.checked)['EoLVol']}</p>
        </ModalBody>
      </Modal>
      <Navbar color="faded" light style = {{width: this.props.selectionwidth}}>
        <NavbarBrand href="/" className="mr-auto" disable="true"></NavbarBrand>
        <Button color = "secondary"  onClick={this.props.sidebartoggle} style={{margin:'0 0'}} active={this.props.sidebarOpen}> Filters</Button>
        <Button color = "secondary"  onClick={this.props.modaltoggle} style={{margin:'0 2.5%'}} active={this.props.modal}> Results</Button>
        <NavbarToggler onClick={this.toggleNavbar} className="mr-2" />
        <Collapse isOpen={!this.state.collapsed} navbar>
          <Nav navbar>
            <NavItem className = "selectcontainer">
              <div className = "select-axis">
                <Label for="exampleSelect" className = "select-axis-item">Select X axis:</Label>
                <Input type="select" placeholder="x axis" name="xselect" id="xSelect" className = "select-axis-item" value={this.state.xaxis} onChange={this.changex}>
                  <option>Material Impacts</option>
                  <option>Cost</option>
                  <option>Disposal Impacts</option>
                  <option>EoL potential</option>
                </Input>
              </div>
              <div className = "select-axis">
                <Label for="exampleSelect" className = "select-axis-item">Select Y axis:</Label>
                <Input type="select" placeholder="y axis" name="yselect" id="ySelect" className = "select-axis-item" value={this.state.yaxis} onChange={this.changey}>
                  <option>Material Impacts</option>
                  <option>Cost</option>
                  <option>Disposal Impacts</option>
                  <option>EoL potential</option>
                </Input>
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

            <div className = "select-switch">
              <Label for="exampleSelect" className = "select-switch-title">X-axis Scale</Label>
              <Label for="exampleSelect" className = "select-switch-front">Normal</Label>
              <Switch onChange={this.xlogchange} checked={this.state.xlog}  className = "select-switch-center" checkedIcon = {false} uncheckedIcon = {false}/>
              <Label for="exampleSelect" className = "select-switch-back">Log</Label>
            </div>
            <div className = "select-switch">
              <Label for="exampleSelect" className = "select-switch-title">Y-axis Scale</Label>
              <Label for="exampleSelect" className = "select-switch-front">Normal</Label>
              <Switch onChange={this.ylogchange} checked={this.state.ylog}  className = "select-switch-center" checkedIcon = {false} uncheckedIcon = {false}/>
              <Label for="exampleSelect" className = "select-switch-back">Log</Label>
            </div>
          </NavItem>
        </Nav>
        </Collapse>
      </Navbar>

      <Plot
        onSelected = {(obj) => this.handleSelected(obj)}
        data = {this.processData(this.props.data,this.props.checked)}
        layout = {{
          shapes: this.addcircle(this.processData(this.props.data,this.props.checked)),
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
            rangeslider: {},
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
//rangeslider: {} onRelayout = {(obj) => this.relayout(obj)}
//range: [this.state.y0,this.state.y1]
//
