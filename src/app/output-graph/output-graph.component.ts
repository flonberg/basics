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
                console.log("this is %o", ev.target.userOptions.name);
                document.getElementById('vidx').innerText = ev.target.userOptions.name;
              //  var visibility = this.visible ? 'visible' : 'hidden';
                return false;

            }
        }
    }
},

    credits: {
      enabled: false
    },
    xAxis: {
      type: 'datetime',
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
            this .options.series[i++]['data'] = res['Patients'][key];
          }
          Highcharts.chart('container', this .options);
        },
        err => {
          console.log(err);
        }
      );
    }

}
