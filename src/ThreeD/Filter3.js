import React, { Component } from 'react';
import { Button } from 'reactstrap';
import CheckboxTree from 'react-checkbox-tree';
import 'react-checkbox-tree/lib/react-checkbox-tree.css';
import './Home3.css';
import check from '.././assets/check.png';
import uncheck from '.././assets/uncheck.png';
import halfCheck from '.././assets/halfCheck.png';
import expandClose from '.././assets/expandClose.png';
import expandOpen from '.././assets/expandOpen.png';
import parentClose from '.././assets/parentClose.png';
import parentOpen from '.././assets/parentOpen.png';
import leaf from '.././assets/leaf.png';

class Filter3 extends Component {
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
      var type1count = -1;
      var type2count = new Array(20).fill(-1);
      if (data.length > 0){
        for (var i = 0; i < data.length ; i++){
          if ( i===0 ||( i>0 && data[i]['Type1'] !== data[i-1]['Type1'])){//new T1 and T2
            processedData['children'].push({
              label: data[i]['Type1'],
              value: data[i]['Type1'],
              children:[
                {
                  label: data[i]['Type2'],
                  value: data[i]['Type2'],
                  children:[
                    {
                      label: data[i]['Name'],
                      value: data[i]['Name'],
                      children:[],
                    },
                  ],
                },
              ],
            })
            type1count ++;
            type2count[type1count] ++;
          }else if(data[i]['Type2'] !== data[i-1]['Type2']){//new T2
            processedData['children'][type1count]['children'].push({
              label: data[i]['Type2'],
              value: data[i]['Type2'],
              children:[{
                label: data[i]['Name'],
                value: data[i]['Name'],
                children:[],
              },],
            })
            type2count[type1count] ++;
          }else{
            processedData['children'][type1count]['children'][type2count[type1count]]['children'].push({
              label: data[i]['Name'],
              value: data[i]['Name'],
              children:[],
            })
          }
        }
      }
      return processedData;
  }

  render() {
      return (
        <div className="Filter3">
          <div className="filtergroup">
            <Button color="secondary" onClick={() => this.props.set("Recycle")} active={this.props.selected.includes("Recycle")} className = "buttonfilter">Recyclable</Button>
          </div>
          <div className="checkboxtree">
            <CheckboxTree
                nodes={[this.processData(this.props.data.sort(function(a, b){
                  if(a['Type1'] == b['Type1']){
                      return (a['Type2'] < b['Type2']) ? -1 : (a['Type2'] > b['Type2']) ? 1 : 0;
                  }else{
                      return (a['Type1'] < b['Type1']) ? -1 : 1;
                  }
                }))]}
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

export default Filter3;
