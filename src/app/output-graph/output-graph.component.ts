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
  binSizeC: number = 10;
  binsC: any
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
        return  Highcharts.dateFormat('%e %b %y %H:%M:%S', this .x) +  this .y + " Plans. "  ;
      }
    },
    series: [{}, {}, {}, {}]
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
          this .makeBins();
          var i = 0;
          for (let key of Object.keys(res['Patients'])) {                   // loop through the Patients
            console.log("129  patine is %o", res['Patients'][key])
            for (let key2 of  res['Patients'][key] ){
           
              
              for (let entry of this .binsC ){
    
                  console.log( "duration is %o",   res['Patients'][key][1]  )
                    if (  key2[1] > entry[0] && key2[1]   <= entry[1] ){
                  //    console.log("entry is  is %o , durations is %o ", entry, res['Patients'][key][1][1] );
                      entry.count++;
                      console.log("137  entry coune is %o", entry.count)
                    }
                  }

                
            }
            console.log("142   binsC is %o", this .binsC)
            this .options.series[i] = [];
          //  this .options.series2[i] = [];
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
  makeBins(){
    this .binsC = [];                                                         // create the array
    var numBins = 60 / this .binSizeC;                                        // create the number of bins = longestExpectedTime / numBins
    for (let i = 0; i < numBins; i++) {
      this .binsC[i] = [i * this .binSizeC, (i + 1) * this .binSizeC];        // set lower and upper bounds for each bin.
      this .binsC[i]['count'] = 0;                                            // make the bin. 
    }
    console.log("binsC is %o ", this .binsC)
  }

}
