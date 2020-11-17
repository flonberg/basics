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
  tst = "hellow world";
  public options: any = {
    chart: {
      type: 'scatter',
      height: 700
    },
    title: {
      text: 'Procedure Duration'
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
        return  Highcharts.dateFormat('%e %b %y %H:%M:%S', this .x) + " Duration:" + this .y + " minutes and test  %o " + this .z ;
      }
    },

    series: [
      {
        name: 'Procedure',
        turboThreshold: 500000,
        data: [
         // [new Date('2018-01-25 18:38:31').getTime(), 2],
         //  [new Date('2018-01-26 18:38:31').getTime(), 4],
      ]
      },

    ]
  }

  constructor(private genSvce: GenService) {
    this .selected = "Treatment";
   }

  ngOnInit() {
    this .getData('121726');
  //  Highcharts.chart('container', this .options);
  }
  getData(code){
    this .genSvce.setPlatform();
    this .genSvce.getWithSelString("SELECT StartDateTime, EndDateTime, ProcedureCode, PatientID FROM ProtomTiming WHERE ProcedureCode = " + code ).subscribe (  
        (res) => {
          var i = 0;
          for (let key of Object.keys(res['Patients'])) {
             console.log("77 key is " + key + "ob is %o", res['Patients'][key]);
             this .options.series[i]['data'] = res['Patients'][key];
             this .options.series[i++]['name'] = key;
             this .options.series[i] = [];
          }

       //   this .options.series[0]['data'] = res['Rdata'];
       //   this .options.series[0]['name'] = 'test';
          console.log("73 data is %o", res )
          Highcharts.chart('container', this .options);
        },
        err => {
          console.log("error 223");
          console.log(err);
        }
      );
    }

}
