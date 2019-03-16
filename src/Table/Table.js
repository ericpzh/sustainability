import React, { Component } from 'react';
import Header from '../Common/Header.js';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import Favicon from 'react-favicon';
import favicon from '../assets/favicon.ico'
import Login from '../Common/Login.js'
import store from 'store';
class BSTable extends React.Component {
  render() {
    if (this.props.data) {
      return (
        <BootstrapTable data={ this.props.data }>
          <TableHeaderColumn dataField='Category' isKey tdStyle={ { whiteSpace: 'normal' } } thStyle={ { whiteSpace: 'normal' } }>Category</TableHeaderColumn>
          <TableHeaderColumn dataField='Number' tdStyle={ { whiteSpace: 'normal' } } thStyle={ { whiteSpace: 'normal' } }>Number</TableHeaderColumn>
        </BootstrapTable>);
    } else {
      return (<p></p>);
    }
  }
}

class Table extends Component {
  constructor(props) {
      super(props);
      this.state = {
        data : [{
          Type1:"",
          Type2:"",
          Name:"",
          Material:0,
          Processing:0,
          EoL:0,
          LifeCycle:0,
          ced:0,
          HumanHealth:0,
          Ecotoxixity:0,
          ResourcesDepletion:0,
          ReCiPe:0,
          Recycle:"",
        }],
        width: window.innerWidth,
        height: window.innerHeight,
      };
      this.initData = this.initData.bind(this);
      this.bool2string = this.bool2string.bind(this);
      this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
      this.expandComponent = this.expandComponent.bind(this);
      this.isExpandableRow = this.isExpandableRow.bind(this);
  }

  expandComponent(row) {
    var data = [];
    for (var i = 0 ; i < this.state.data.length ; i++){
      if (this.state.data[i]['Name'] == row['Name']){
        data = [
          {Category: "Material Carbon Footprint(kg CO2 eq.)", Number:this.state.data[i]['Material']},
          {Category: "Processing Carbon Footprint(kg CO2 eq.)", Number:this.state.data[i]['Processing']},
          {Category: "EoL Carbon Footprint(kg CO2 eq.)", Number:this.state.data[i]['EoL']},
          {Category: "Life Cycle Carbon Footprint(kg CO2 eq.)", Number:this.state.data[i]['LifeCycle']},
          {Category: "Total LifeCycle CED(MJ)", Number:this.state.data[i]['ced']},
          {Category: "LifeCycle ReCiPe Human Health(DALY)", Number:this.state.data[i]['HumanHealth']},
          {Category: "LifeCycle ReCiPe Ecotoxixity(species.year)", Number:this.state.data[i]['Ecotoxixity']},
          {Category: "LifeCycle ReCiPe Resources Depletion($)", Number:this.state.data[i]['ResourcesDepletion']},
          {Category: "LifeCycle ReCiPe Endpoints", Number:this.state.data[i]['ReCiPe']},
          {Category: "Recyclable", Number:this.state.data[i]['Recycle']}
        ];
        break;
      }
    }
    return (
      <BSTable data={ data } />
    );
  }
  isExpandableRow(row) {
    return true;
  }

  componentDidMount() {
    var csvFilePath = require("../assets/Idematapp.csv");
    var Papa = require("papaparse");
    Papa.parse(csvFilePath, {
      header: true,
      download: true,
      skipEmptyLines: true,
      complete: this.initData
    });
    window.addEventListener('resize', this.updateWindowDimensions);
    this.updateWindowDimensions();
    document.title = "Sustainable Materials Advisor";
  }
  componentWillUnmount(){
    window.removeEventListener('resize', this.updateWindowDimensions);
  }
  updateWindowDimensions() {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight,
     });
  }

  bool2string(bool){
    if (bool == 1){
      return "Yes"
    }else{
      return "No"
    }
  }

  initData(result) {
    var data = [];
    for (var i = 0; i < result.data.length; i++){
      data.push({
        Type1:result.data[i]["Type1"],
        Type2:result.data[i]["Type2"],
        Name:result.data[i]["Name"],
        Material:Math.round(parseFloat(result.data[i]["Material Carbon Footprint(kg CO2 eq.)"]) * 1000) / 1000,
        Processing:Math.round(parseFloat(result.data[i]["Processing Carbon Footprint(kg CO2 eq.)"]) * 1000) / 1000,
        EoL:Math.round(parseFloat(result.data[i]["EoL Carbon Footprint(kg CO2 eq.)"]) * 1000) / 1000,
        LifeCycle:Math.round(parseFloat(result.data[i]["Life Cycle Carbon Footprint(kg CO2 eq.)"]) * 1000) / 1000,
        ced:Math.round(parseFloat(result.data[i]["Total LifeCycle CED(MJ)"]) * 1000) / 1000,
        HumanHealth:Math.round(parseFloat(result.data[i]["LifeCycle ReCiPe Human Health(DALY)"]) * 1000) / 1000,
        Ecotoxixity:Math.round(parseFloat(result.data[i]["LifeCycle ReCiPe Ecotoxixity(species.year)"]) * 1000) / 1000,
        ResourcesDepletion:Math.round(parseFloat(result.data[i]["LifeCycle ReCiPe Resources Depletion($)"]) * 1000) / 1000,
        ReCiPe:Math.round(parseFloat(result.data[i]["LifeCycle ReCiPe Endpoints"]) * 1000) / 1000,
        Recycle:this.bool2string(result.data[i]["Recycle"]),
      });

    }
    this.setState({
      data: data,
    });
  }

  render() {
    var options = {
      defaultSortName: 'Type1',
      defaultSortOrder: 'aesc',
    };
    if (store.get('password') === store.get('correctpassword') && typeof store.get('correctpassword') !== "undefined"){
      if (this.state.width < 1700){
        return (
          <div className="Table">
          <Favicon url={favicon} />
           <Header/>
           <BootstrapTable data={this.state.data} options={ options } expandComponent={ this.expandComponent } expandColumnOptions={ { expandColumnVisible: true } } expandableRow={ this.isExpandableRow }>
              <TableHeaderColumn dataField='Type1' dataSort filter={ { type: 'TextFilter', delay: 100 } } tdStyle={ { whiteSpace: 'normal' } } thStyle={ { whiteSpace: 'normal' } }> Caterogry </TableHeaderColumn>
              <TableHeaderColumn dataField='Type2' dataSort filter={ { type: 'TextFilter', delay: 100 } } tdStyle={ { whiteSpace: 'normal' } } thStyle={ { whiteSpace: 'normal' } }> Sub-Caterogry </TableHeaderColumn>
              <TableHeaderColumn dataField='Name' isKey dataSort filter={ { type: 'TextFilter', delay: 100 } } tdStyle={ { whiteSpace: 'normal' } } thStyle={ { whiteSpace: 'normal' } }> Name </TableHeaderColumn>
          </BootstrapTable>
          </div>
        );
      }else{
        return (
          <div className="Table">
          <Favicon url={favicon} />
           <Header/>
           <BootstrapTable data={this.state.data} options={ options } >
              <TableHeaderColumn dataField='Type1' dataSort filter={ { type: 'TextFilter', delay: 100 } } tdStyle={ { whiteSpace: 'normal' } } thStyle={ { whiteSpace: 'normal' } }> Caterogry </TableHeaderColumn>
              <TableHeaderColumn dataField='Type2' dataSort filter={ { type: 'TextFilter', delay: 100 } } tdStyle={ { whiteSpace: 'normal' } } thStyle={ { whiteSpace: 'normal' } }> Sub-Caterogry </TableHeaderColumn>
              <TableHeaderColumn dataField='Name' isKey dataSort filter={ { type: 'TextFilter', delay: 100 } } tdStyle={ { whiteSpace: 'normal' } } thStyle={ { whiteSpace: 'normal' } }> Name </TableHeaderColumn>
              <TableHeaderColumn dataField='Material'  dataSort filter={ { type: 'NumberFilter', delay: 100, numberComparators: ['>','=','<'],defaultValue: { number: 0, comparator: '>=' } }} tdStyle={ { whiteSpace: 'normal' } } thStyle={ { whiteSpace: 'normal' } }>Material Carbon Footprint(kg CO2 eq.)</TableHeaderColumn>
              <TableHeaderColumn dataField='Processing'  dataSort filter={ { type: 'NumberFilter', delay: 100, numberComparators: ['>','=','<'],defaultValue: { number: 0, comparator: '>=' } }} tdStyle={ { whiteSpace: 'normal' } } thStyle={ { whiteSpace: 'normal' } }>Processing Carbon Footprint(kg CO2 eq.)</TableHeaderColumn>
              <TableHeaderColumn dataField='EoL' dataSort filter={ { type: 'NumberFilter', delay: 100, numberComparators: ['>','=','<'],defaultValue: { number: 0, comparator: '>=' }}} tdStyle={ { whiteSpace: 'normal' } } thStyle={ { whiteSpace: 'normal' } }>EoL Carbon Footprint(kg CO2 eq.)</TableHeaderColumn>
              <TableHeaderColumn dataField='LifeCycle' dataSort filter={ { type: 'NumberFilter', delay: 100, numberComparators: ['>','=','<'],defaultValue: { number: 0, comparator: '>=' } }} tdStyle={ { whiteSpace: 'normal' } } thStyle={ { whiteSpace: 'normal' } }>Life Cycle Carbon Footprint(kg CO2 eq.)</TableHeaderColumn>
              <TableHeaderColumn dataField='ced' dataSort filter={ { type: 'NumberFilter', delay: 100, numberComparators: ['>','=','<'],defaultValue: { number: 0, comparator: '>=' }}} tdStyle={ { whiteSpace: 'normal' } } thStyle={ { whiteSpace: 'normal' } }>Total LifeCycle CED(MJ)</TableHeaderColumn>
              <TableHeaderColumn dataField='HumanHealth' dataSort filter={ { type: 'NumberFilter', delay: 100, numberComparators: ['>','=','<'],defaultValue: { number: 0, comparator: '>=' } }} tdStyle={ { whiteSpace: 'normal' } } thStyle={ { whiteSpace: 'normal' } }>LifeCycle ReCiPe Human Health(DALY)</TableHeaderColumn>
              <TableHeaderColumn dataField='Ecotoxixity' dataSort filter={ { type: 'NumberFilter', delay: 100, numberComparators: ['>','=','<'],defaultValue: { number: 0, comparator: '>=' }}} tdStyle={ { whiteSpace: 'normal' } } thStyle={ { whiteSpace: 'normal' } }>LifeCycle ReCiPe Ecotoxixity(species.year)</TableHeaderColumn>
              <TableHeaderColumn dataField='ResourcesDepletion' dataSort filter={ { type: 'NumberFilter', delay: 100, numberComparators: ['>','=','<'],defaultValue: { number: 0, comparator: '>=' } }} tdStyle={ { whiteSpace: 'normal' } } thStyle={ { whiteSpace: 'normal' } }>LifeCycle ReCiPe Resources Depletion($)</TableHeaderColumn>
              <TableHeaderColumn dataField='ReCiPe' dataSort filter={ { type: 'NumberFilter', delay: 100, numberComparators: ['>','=','<'],defaultValue: { number: 0, comparator: '>=' }}} tdStyle={ { whiteSpace: 'normal' } } thStyle={ { whiteSpace: 'normal' } }>LifeCycle ReCiPe Endpoints</TableHeaderColumn>
              <TableHeaderColumn dataField='Recycle' dataSort filter={ { type: 'TextFilter', delay: 100 } } tdStyle={ { whiteSpace: 'normal' } } thStyle={ { whiteSpace: 'normal' } }>Recyclable</TableHeaderColumn>
          </BootstrapTable>
          </div>
        );
      }
    }else{
        return(
          <div>
            <Favicon url={favicon} />
            <Login/>
          </div>
        );
      }
  }
}

export default Table;
