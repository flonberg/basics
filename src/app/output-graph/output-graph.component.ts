import { Component, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';
import { GenService } from '../gen.service';
import { throwMatDialogContentAlreadyAttachedError } from '@angular/material';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { keyframes } from '@angular/animations';
import { ActivatedRoute } from '@angular/router';

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
  procedureCode: number;
  binSizeC: number = 5;                                                 // default number of minutes per bin
  binsC: any
  numInBin: any;
  treatSelected = "Treatment";
  binSizeCSelected = "5"
  dateRange = "Last_30_Days";
  ngOnInit() {
    this .procedureCode = 121726;
    this .getData();                                                // set for 'Treatment'
  }
  //////////   set parameters for upper graph  \\\\\\\\\\\\\\
    public options: any = {
      chart: {
        type: 'scatter',
        height: 500
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
              //     (<HTMLInputElement>document.getElementById('vidx2').value) = ev.target.userOptions.name;     // load UserID to DOM
                    var inputElement = <HTMLInputElement>document.getElementById('vidx2');
                    inputElement.value = ev.target.userOptions.name;
                    var url = window.location.href;
                          if (url.indexOf('?') > -1){                                          // if there IS already a param
                            url = url.split('?')[0]
                            url += '?param='+ ev.target.userOptions.name
                          }else{
                            url += '?param='+ ev.target.userOptions.name
                          }
                  window.location.href = url;
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
      yAxis: {
        min: 0,
        title: {
            text: 'Minutes  '
          },
      },
      tooltip: {
        formatter: function (){
          return  Highcharts.dateFormat('%e %b %y %H:%M:%S', this .x) + " Duration:" + this .y + " minutes. "  ;
        }
      },
      series: [{}]
    }
    public options2: any =
    {
      chart: {
        type: 'column',
        height: 300
      },
      title: {
        text: ''
      },
      xAxis: {
        crosshair: true,
        format: "test"
        },
      yAxis: {
        min: 0,
        title: {
            text: 'Procedures'
          },
        stackLabels: {
            enabled: true,
            style: {
                fontWeight: 'bold',
                color: ( // theme
                    Highcharts.defaultOptions.title.style &&
                    Highcharts.defaultOptions.title.style.color
                ) || 'gray'
            }
        }
      },
      plotOptions: {
        column: {
            stacking: 'normal',
            dataLabels: {
                enabled: false
            }
        }
    },
      click: function (e) {
        console.log(
            Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', e.xAxis[0].value),
            e.yAxis[0].value
        )
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
    param1:string;
  constructor(private genSvce: GenService, private route: ActivatedRoute) {
    this .selected = "Treatment";
    this .route.queryParams.subscribe(params => {
      this .param1 = params['param'];
      });
    }
  setProcedureCode(n){
    this .procedureCode = n;
    this .getData()
  }
  setDateRange(str){
    this .dateRange = str;
    this .getData(str);
  }
   ////////////  make the bins and bin the data       \\\\\\\\\\\\\\
  setBinSize(n){
    this .binSizeC = n;
    this .makeBins();                                                     // make the bins
    this .binData();                                                      // bin the data
    Highcharts.chart('container2', this .options2);                       // redo the Graph with new binSize
  }
  ////////   get the data from BB or 242   \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
  getData(dateRange?){
    this .genSvce.setPlatform();                                            // switch Dev = BB or Prod = 242
    var selStr = "SELECT StartDateTime, EndDateTime, ProcedureCode, PatientID FROM ProtomTiming ";
    selStr += " WHERE ProcedureCode = " + this .procedureCode               // reflect user-selected activityType
    console.log("190 selStr is %o", selStr)
    this .genSvce.getWithSelString(selStr, dateRange  ).subscribe (
        (res) => {
          this .setData(res);                                               // store the data
          this .makeBins();                                                 // make Histogram bins
          this .binData();                                                  // put the data in bins
          Highcharts.chart('container', this .options);                     // Draw top graph scatter plot
          Highcharts.chart('container2', this .options2);                   // Draw bottom graph Histogram 
        },
        err => {
          console.log(err);
        }
      );
    }
  setData(inpData){
    this .data = inpData;
  }
  public stackedBins: any;
  public toSeePatID: string;
  binData(){
    this .stackedBins = new Array();
    var i = 0;
    /////////  make the bins for each patient  \\\\\\\\\\\\\\\\\\\\\
    var patCount2 = 0;                                                        // counter => index for patientLoop
    for (let key of Object.keys(this .data['Patients'])) {                    // loop through the Patients
      var tstObj = {'name': key, 'data': []}                                  // make an objest to hole the patient bin data
      this .stackedBins.push(tstObj);                                         // push the object into the main array;
      var binCount2 = 0;                                                      // counter => index for bin loop
      for (let binEntry of this .binsC){
        this .stackedBins[patCount2].data[binCount2++] = 0                    // create the bin with count = 0
      }
      patCount2++;
    }
    ////////   bin the data  \\\\\\\\\\\\\\\\\\\\\\\
    var patCount2 = 0;                                                        // patient loop counter
    for (let key of Object.keys(this .data['Patients'])) {                    // loop over patients
      for (let entry of this .data['Patients'][key]) {                        // loop over each patient's durations
        var binCount2 = 0;                                                    // loop counter
        for (let binEntry of this .binsC ){
          if (entry[1] > binEntry[0] && entry[1] <= binEntry[1]){             // if duration is withing the bin limits
            this .stackedBins[patCount2]['data'][binCount2]++                        // increment the count in that bin
          }
          binCount2++;
        }
      }
      patCount2++;
    }
    ////////     Load data into  Top Graph scatter plot       \\\\\\\\\\\\\\\\\\\
    for (let key of Object.keys(this .data['Patients'])) {                    // loop through the Patients
            this .options.series[i] = [];
            this .options.series[i]['name'] = key;
            this .options.series[i]['data'] = this .data['Patients'][key];
            i++;
          }
    ////////    Load data into Bottom Graph Histogram       \\\\\\\\\\\\\\\\\\\\
    this .options2.series = this .stackedBins;                                // load the data into lower graph
    this .options2.xAxis['categories'] = this .binsC['Label'];                
  }
///////////  create the bins for the selected binSize.
  makeBins(){
    var maxDurationExpected = 60;                                             // set the maximum expected activityID duration
    this .binsC = [];                                                         // create the array of bins
    this .numInBin = [];
    this .binsC['Label'] = [];
    var numBins = maxDurationExpected / this .binSizeC;                      // create max number of bins = longestExpectedTime / numBins
    for (let i = 0; i < numBins; i++) {
      this .binsC[i] = [i * this .binSizeC, (i + 1) * this .binSizeC];        // set lower and upper bounds for each bin.
      this .binsC['Label'][i] = i * this .binSizeC + " to " +( i + 1) * this .binSizeC;   // the label for the bin in the graph
      this .binsC[i]['count'] = 0;                                            // make the bin.
      this .numInBin[i] = 0;                                                  // zero out the count in each bin. 
    }
   }
}
