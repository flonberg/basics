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
      text: 'Sample Scatter Plot'
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
    series: [
      {
        name: 'Normal',
        turboThreshold: 500000,
        data: [
         // [new Date('2018-01-25 18:38:31').getTime(), 2],
         //  [new Date('2018-01-26 18:38:31').getTime(), 4],
      ]
      },
      {
        name: 'Abnormal',
        turboThreshold: 500000,
        data: [[new Date('2020-10-05 18:38:31').getTime(), 7]]
      },
      {
        name: 'real',
        turboThreshold: 500000,
        data: []
      }
    ]
  }

  constructor(private genSvce: GenService) { }

  ngOnInit() {
    this .getData();
    Highcharts.chart('container', this .options);
  }
  getData(){

    this .genSvce.setPlatform();
    this .genSvce.getWithSelString("SELECT StartDateTime, EndDateTime, ProcedureCode FROM ProtomTiming WHERE PatientID ='700-57-44' AND ProcedureCode = '121726'" ).subscribe (  
        (res) => {
          this .options.series[0]['data'] = res;
          Highcharts.chart('container', this.options);
        },
        err => {
          console.log("error 223");
          console.log(err);
        }
      );
    }

}
