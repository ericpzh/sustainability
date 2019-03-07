import React, { Component } from 'react';
import Header from '../Header.js';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import Favicon from 'react-favicon';
import favicon from '../assets/favicon.ico'
import Login from '../Login/Login.js'
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
        data : [{Type:"",Name:"",Material:"",Disposal:"",EoL:"",Cost:"",RoHS:"",Food:"",Recycle:"",Density:""}],
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
        data = [{Category: "Material Impacts(kg-CO2-eq)", Number:this.state.data[i]['Material']},
                    {Category: "Disposal Impacts(kg-CO2-eq)", Number:this.state.data[i]['Disposal']},
                    {Category: "EoL Potential(kg-CO2-eq", Number:this.state.data[i]['EoL']},
                    {Category: "Cost ($)", Number:this.state.data[i]['Cost']},
                    {Category: "RoHS", Number:this.state.data[i]['RoHS']},
                    {Category: "Food Contact", Number:this.state.data[i]['Food']},
                    {Category: "Recyclable", Number:this.state.data[i]['Recycle']}];
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
    var csvFilePath = require("../assets/Granta.csv");
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
      if(result.data[i]["Density"]==0){
        data.push({
          Type:result.data[i]["Type"],
          Name:result.data[i]["Name"],
          Material:0,
          Disposal:0,
          EoL:0,
          Cost:0,
          RoHS:this.bool2string(result.data[i]["RoHS"]),
          Food:this.bool2string(result.data[i]["Food"]),
          Recycle:this.bool2string(result.data[i]["Recycle"]),
        });
      }else{
        data.push({
          Type:result.data[i]["Type"],
          Name:result.data[i]["Name"],
          Material:Math.round(parseFloat(result.data[i]["Material Impacts"])/parseFloat(result.data[i]["Density"]) * 1000) / 1000,
          Disposal:Math.round(parseFloat(result.data[i]["Disposal Impacts"])/parseFloat(result.data[i]["Density"]) * 1000) / 1000,
          EoL:Math.round(parseFloat(result.data[i]["EoL potential"])/parseFloat(result.data[i]["Density"]) * 1000) / 1000,
          Cost:Math.round(parseFloat(result.data[i]["Cost"])/parseFloat(result.data[i]["Density"]) * 1000) / 1000,
          RoHS:this.bool2string(result.data[i]["RoHS"]),
          Food:this.bool2string(result.data[i]["Food"]),
          Recycle:this.bool2string(result.data[i]["Recycle"]),
        });
      }
    }
    this.setState({
      data: data,
    });
  }

  render() {
    var options = {
      defaultSortName: 'Type',
      defaultSortOrder: 'aesc',
    };  if (store.get('password') !== store.get('correctpassword')){
        return(
          <div>
            <Login/>
          </div>
        );
      }else{
        if (this.state.width < 1024){
          return (
            <div className="Table">
            <Favicon url={favicon} />
             <Header/>
             <BootstrapTable data={this.state.data} options={ options } expandComponent={ this.expandComponent } expandColumnOptions={ { expandColumnVisible: true } } expandableRow={ this.isExpandableRow }>
                <TableHeaderColumn dataField='Type' dataSort filter={ { type: 'TextFilter', delay: 100 } } tdStyle={ { whiteSpace: 'normal' } } thStyle={ { whiteSpace: 'normal' } }> Type </TableHeaderColumn>
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
                <TableHeaderColumn dataField='Type' dataSort filter={ { type: 'TextFilter', delay: 100 } } tdStyle={ { whiteSpace: 'normal' } } thStyle={ { whiteSpace: 'normal' } }> Type </TableHeaderColumn>
                <TableHeaderColumn dataField='Name' isKey dataSort filter={ { type: 'TextFilter', delay: 100 } } tdStyle={ { whiteSpace: 'normal' } } thStyle={ { whiteSpace: 'normal' } }> Name </TableHeaderColumn>
                <TableHeaderColumn dataField='Material'  dataSort filter={ { type: 'NumberFilter', delay: 100, numberComparators: ['>','=','<'],defaultValue: { number: 0, comparator: '>=' } }} tdStyle={ { whiteSpace: 'normal' } } thStyle={ { whiteSpace: 'normal' } }>Material Impacts(kg-CO2-eq)</TableHeaderColumn>
                <TableHeaderColumn dataField='Disposal' dataSort filter={ { type: 'NumberFilter', delay: 100, numberComparators: ['>','=','<'],defaultValue: { number: 0, comparator: '>=' }}} tdStyle={ { whiteSpace: 'normal' } } thStyle={ { whiteSpace: 'normal' } }>Disposal Impacts(kg-CO2-eq)</TableHeaderColumn>
                <TableHeaderColumn dataField='EoL' dataSort filter={ { type: 'NumberFilter', delay: 100, numberComparators: ['>','=','<'],defaultValue: { number: 0, comparator: '>=' } }} tdStyle={ { whiteSpace: 'normal' } } thStyle={ { whiteSpace: 'normal' } }>EoL Potential(kg-CO2-eq)</TableHeaderColumn>
                <TableHeaderColumn dataField='Cost' dataSort filter={ { type: 'NumberFilter', delay: 100, numberComparators: ['>','=','<'],defaultValue: { number: 0, comparator: '>=' }}} tdStyle={ { whiteSpace: 'normal' } } thStyle={ { whiteSpace: 'normal' } }>Cost ($)</TableHeaderColumn>
                <TableHeaderColumn dataField='RoHS' dataSort filter={ { type: 'NumberFilter', delay: 100, numberComparators: ['>','=','<'],defaultValue: { number: 0, comparator: '>=' } }} tdStyle={ { whiteSpace: 'normal' } } thStyle={ { whiteSpace: 'normal' } }>RoHS</TableHeaderColumn>
                <TableHeaderColumn dataField='Food' dataSort filter={ { type: 'NumberFilter', delay: 100, numberComparators: ['>','=','<'],defaultValue: { number: 0, comparator: '>=' }}} tdStyle={ { whiteSpace: 'normal' } } thStyle={ { whiteSpace: 'normal' } }>Food Contact</TableHeaderColumn>
                <TableHeaderColumn dataField='Recycle' dataSort filter={ { type: 'NumberFilter', delay: 100, numberComparators: ['>','=','<'],defaultValue: { number: 0, comparator: '>=' } }} tdStyle={ { whiteSpace: 'normal' } } thStyle={ { whiteSpace: 'normal' } }>Recyclable</TableHeaderColumn>
            </BootstrapTable>
            </div>
          );
        }
      }
  }
}

export default Table;
