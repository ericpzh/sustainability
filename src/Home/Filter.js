import React, { Component } from 'react';
import { Button, ButtonGroup } from 'reactstrap';
import CheckboxTree from 'react-checkbox-tree';
import 'react-checkbox-tree/lib/react-checkbox-tree.css';
import './Home.css';
import check from '.././assets/check.png';
import uncheck from '.././assets/uncheck.png';
import halfCheck from '.././assets/halfCheck.png';
import expandClose from '.././assets/expandClose.png';
import expandOpen from '.././assets/expandOpen.png';
import parentClose from '.././assets/parentClose.png';
import parentOpen from '.././assets/parentOpen.png';
import leaf from '.././assets/leaf.png';

class Filter extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
    this.processData = this.processData.bind(this);
  }

  processData(data){
      var processedData = {
        label: 'All Material',
        value: 'All Material',
        children:[],
      };
      if (data.length > 0){
        processedData['children'].push({
          label : data[0]['Type'],
          value : data[0]['Type'],
          children : [],
        });
        for (var i = 1; i < data.length ; i++){
          if (data[i]['Type'] !== "" && data[i]['Type'] !== data[i-1]['Type']){
            processedData['children'].push({
              label : data[i]['Type'],
              value : data[i]['Type'],
              children : [],
            });
          }
        }
        for (var i = 0; i < data.length ; i++){
          if (data[i]['Type'] !== ""){
            for (var j = 0; j < processedData['children'].length ; j++){
              if (processedData['children'][j]['label'] === data[i]['Type']){
                processedData['children'][j]['children'].push({
                  label : data[i]['Name'],
                  value : data[i]['Name'],
                  children : [],
                });
                break;
              }
            }
          }
        }
      }
      return processedData;
  }

  render() {
      return (
        <div className="Filter">
          <div className="filtergroup">
            <ButtonGroup vertical>
            <Button color="success" onClick={() => this.props.set("RoHS")} active={this.props.selected.includes("RoHS")} className = "Button1">RoHS</Button>
            <Button color="success" onClick={() => this.props.set("Food")} active={this.props.selected.includes("Food")} className = "Button1">Food Contact</Button>
            <Button color="success" onClick={() => this.props.set("Recycle")} active={this.props.selected.includes("Recycle")} className = "Button1">Recyclable</Button>
            </ButtonGroup>
          </div>
          <div className="checkboxtree">
            <CheckboxTree
                nodes={[this.processData(this.props.data.sort(function(a, b){return a['Type'] > b['Type']}))]}
                checked={this.props.checked}
                expanded={this.props.expanded}
                onCheck={this.props.onCheck}
                onExpand={this.props.onExpand}
                showExpandAll={false}
                expandOnClick={true}
                icons={{
                    check: <span><img src={check} alt="404"/></span>,
                    uncheck: <span><img src={uncheck} alt="404"/></span>,
                    halfCheck: <span><img src={halfCheck} alt="404"/></span>,
                    expandClose: <span><img src={expandClose} alt="404"/></span>,
                    expandOpen: <span><img src={expandOpen} alt="404"/></span>,
                    parentClose: <span><img src={parentClose} alt="404"/></span>,
                    parentOpen: <span><img src={parentOpen} alt="404"/></span>,
                    leaf: <span><img src={leaf} alt="404"/></span>,
                }}

            />
          </div>
        </div>
      );
    }
  }

export default Filter;
