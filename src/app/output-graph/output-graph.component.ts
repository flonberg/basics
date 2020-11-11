import { Component, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';
import { GenService } from '../gen.service';
import { throwMatDialogContentAlreadyAttachedError } from '@angular/material';

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
        return  Highcharts.dateFormat('%e %b %y %H:%M:%S', this .x) + " Duration:" + this .y + " minutes"
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

  constructor(private genSvce: GenService) { }

  ngOnInit() {
    this .getData('121726');
  //  Highcharts.chart('container', this .options);
  }
  getData(code){
    this .genSvce.setPlatform();
    this .genSvce.getWithSelString("SELECT StartDateTime, EndDateTime, ProcedureCode, PatientID FROM ProtomTiming WHERE ProcedureCode = " + code ).subscribe (  
        (res) => {
          this .options.series[0]['data'] = res['Rdata'];
          console.log("73 data is %o", res )
          Highcharts.chart('container', this.options);
        },
        err => {
          console.log("error 223");
          console.log(err);
        }
      );
    }

}
