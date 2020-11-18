import { Component, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';
import { GenService } from '../gen.service';
import { throwMatDialogContentAlreadyAttachedError } from '@angular/material';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { keyframes } from '@angular/animations';

declare var require: any;
let Boost = require('highcharts/modules/boost');
let noData = require('highcharts/modules/no-data-to-display');
let More = require('highcharts/highcharts-more');

Boost(Highcharts);
noData(Highcharts);
More(Highcharts);
noData(Highcharts);

@ Component({
  selector: 'app-output-graph',
  templateUrl: './output-graph.component.html',
  styleUrls: ['./output-graph.component.css']
})
export class OutputGraphComponent implements OnInit {
  data: any;
  selected:string;
  procedureCode: string;
  public options: any = {
    chart: {
      type: 'scatter',
      height: 700
    },
    title: {
      text: 'Procedure Duration'
    },
    click: function(e) {
      console.log(
          Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', e.xAxis[0].value),
          e.yAxis[0].value
      )
  },
  plotOptions: {
    series: {
        events: {
            legendItemClick: function (ev) {
                document.getElementById('vidx').innerText = ev.target.userOptions.name;     // load UserID to DOM
                return false;                                                               // do NOT hide data
            }
        }
    }
  },
    credits: {
      enabled: false
    },
    xAxis: {
      type: 'column',
      labels: {
        formatter: function () {
          return Highcharts.dateFormat('%e %b %y', this .value);
        }
      }
    },
    tooltip: {
      formatter: function (){
        return  Highcharts.dateFormat('%e %b %y %H:%M:%S', this .x) + " Duration:" + this .y + " minutes. "  ;
      }
    },
    series: [
      {},
    ]
  }
  public options2: any = {
    chart: {
      type: 'column',
      height: 300
    },
    title: {
      text: 'Procedure Duration'
    },
    click: function(e) {
      console.log(
          Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', e.xAxis[0].value),
          e.yAxis[0].value
      )
  },
  plotOptions: {
    series: {
        events: {
            legendItemClick: function (ev) {
                document.getElementById('vidx').innerText = ev.target.userOptions.name;     // load UserID to DOM
                return false;                                                               // do NOT hide data
            }
        }
    }
  },
    credits: {
      enabled: false
    },
    xAxis: {
      
      crosshair: true
  },
    tooltip: {
      formatter: function (){
        return  Highcharts.dateFormat('%e %b %y %H:%M:%S', this .x) + " Duration:" + this .y + " minutes. "  ;
      }
    },
    
    series: [
      {
      name: 'Tokyo',
      data: [49.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4]

  }, {
      name: 'New York',
      data: [83.6, 78.8, 98.5, 93.4, 106.0, 84.5, 105.0, 104.3, 91.2, 83.5, 106.6, 92.3]

  }, {
      name: 'London',
      data: [48.9, 38.8, 39.3, 41.4, 47.0, 48.3, 59.0, 59.6, 52.4, 65.2, 59.3, 51.2]

  }, {
      name: 'Berlin',
      data: [42.4, 33.2, 34.5, 39.7, 52.6, 75.5, 57.4, 60.4, 47.6, 39.1, 46.8, 51.1]

  }
]
  }
  constructor(private genSvce: GenService) {
    this .selected = "Treatment";
   }

  ngOnInit() {
    this .getData('121726');                                      // set for 'Treatment'
  }
  getData(code){
    this .procedureCode = code;
    this .genSvce.setPlatform();
    this .options.series = [];
    var selStr = "SELECT StartDateTime, EndDateTime, ProcedureCode, PatientID FROM ProtomTiming ";
    if (+code > 0 )
      selStr += " WHERE ProcedureCode = " + code
    this .genSvce.getWithSelString(selStr  ).subscribe (
        (res) => {
          var i = 0;
          for (let key of Object.keys(res['Patients'])) {
            this .options.series[i] = [];
            this .options.series[i]['name'] = key;
            this .options.series[i]['data'] = res['Patients'][key];
            this .options2.series[i]['name'] = key;
            this .options2.series[i]['data'] = res['hist']['count'];
            i++;
          }
          this .options2.xAxis.categories =  res['hist']['name'];

          Highcharts.chart('container', this .options);
          Highcharts.chart('container2', this .options2);
        },
        err => {
          console.log(err);
        }
      );
    }

}
