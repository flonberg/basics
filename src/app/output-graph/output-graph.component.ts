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
  numInBin: any;
  public options: any = {
    chart: {
      type: 'scatter',
      height: 700
    },
    title: {
      text: 'Procedure Duration'
    },
    click: function (e) {
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
  public options2: any =
  {
    chart: {
      type: 'column',
      height: 300
    },
    title: {
      text: 'Procedure Duration'
    },
    xAxis: {
      crosshair: true,
      format: "test"
      },
    click: function (e) {
      console.log(
          Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', e.xAxis[0].value),
          e.yAxis[0].value
      )
    },
    plotOptions: {
    },
      credits: {
        enabled: false
      },

    tooltip: {
      formatter: function (){
        return   this .y + " Plans. "  ;
      }
    },
      series: []
  }

  constructor(private genSvce: GenService) {
    this .selected = "Treatment";
   }

  ngOnInit() {
    this .getData('121726');                                      // set for 'Treatment'
  }
  setBinSize(n){
    this .binSizeC = n;
    this .makeBins();
    this .binData();
    Highcharts.chart('container2', this .options2);

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
          this .setData(res);
          this .makeBins();
          this .binData();

      //    this .options2.xAxis.categories =  res['hist']['name'];
          Highcharts.chart('container', this .options);
          Highcharts.chart('container2', this .options2);
        },
        err => {
          console.log(err);
        }
      );
    }
  setData(inpData){
    this .data = inpData;
  }
  binData(){
    var i = 0;
    for (let key of Object.keys(this .data['Patients'])) {                   // loop through the Patients
      for (let key2 of  this .data['Patients'][key] ){                       // loop thru the patients Session Durations
        var binCount = 0;
        for (let entry of this .binsC ){                              // loop thry the bins
          if (  key2[1] > entry[0] && key2[1]   <= entry[1] ){      // if the Duration is in the bin
            entry.count++;                                          // increment that Bin count.
            this .numInBin[binCount]++
          }
          binCount++;
        }
      }

      this .options.series[i] = [];
      this .options.series[i]['name'] = key;
      this .options.series[i]['data'] = this .data['Patients'][key];

      this .options2.series[0] = [];
      this .options2.series[0]['name'] = 'Minutes';
      this .options2.series[0]['data'] = this .numInBin;
      this .options2.xAxis['categories'] = this .binsC['Label'];
      i++;
    }
  }
  makeBins(){
    this .binsC = [];                                                         // create the array
    this .numInBin = [];
    this .binsC['Label'] = [];
    var numBins = 60 / this .binSizeC;                                        // create the number of bins = longestExpectedTime / numBins
    for (let i = 0; i < numBins; i++) {
      this .binsC[i] = [i * this .binSizeC, (i + 1) * this .binSizeC];        // set lower and upper bounds for each bin.
      this .binsC['Label'][i] = i * this .binSizeC + " to " +( i + 1) * this .binSizeC;
      this .binsC[i]['count'] = 0;                                            // make the bin.
      this .numInBin[i] = 0;
    }

  }

}
