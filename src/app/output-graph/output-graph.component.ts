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
  typeSelected = "Duration by Date";
  treatSelected = "Treatment";
  binSizeCSelected = "5"
  dateRange = "Last_30_Days";
  ngOnInit() {
    this .procedureCode = 121726;
    this .getData();                                                // set for 'Treatment'
  }
  modalString1 = ''; modalString2 = '';
  showProcedure(ev){
    console.log('41' + ev);
  }
  showAvStdDev(ev){
    var modal = document.getElementById('myModal');
    modal.style.display = "block";
    var av = this .data.average[ev.target.userOptions.name];
    this .modalString1 =this .data.averageByKey[ev.target.userOptions.name] + " min";
    this .modalString2 =this .data.sigma[ev.target.userOptions.name] + " min";

    ;
    console.log("44 data %o", this .data.average.index)
    console.log("3333 %o", ev.target.userOptions.name);
  }
  closeModal(){
    var modal = document.getElementById('myModal');
    modal.style.display = "none";
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
                    this .showAvStdDev(ev); // this function is known because of the 'bind(this )'
                    let cornerY = document.getElementById('vidx'),
                    value = "test"
                    cornerY.innerHTML = "Y value: " + value
                    return false ;
                  }.bind(this )    // !!!!!!allows acces to outside functions. 
              },
              point: {
                events: {
                    click: function () {
                        alert('Category: ' + this.category + ', value: ' + this.y);
                    }
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
          return  Highcharts.dateFormat('%e %b ', this .x) + " duration:" + this .y + " minutes. "  ;
        }.bind(this)
      },
      series: [{}]                                // data is loaded in the binData() function
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
    public options3: any =
    {
      chart: {
        zoomType: 'xy'
      },
      title: {
          text: 'Patient Duration Average and Standard Deviation'
      },
      xAxis: {}


    }
    param1:string;
    procStr: any
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
    this .makeProcedureBins()                                             // make the bins for the Procedures 
    this .binData();                                                      // bin the data
    Highcharts.chart('container2', this .options2);                       // redo the Graph with new binSize
  }
  ////////   get the data from BB or 242   \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
  getData(dateRange?){
    this .genSvce.setPlatform();                                            // switch Dev = BB or Prod = 242
    var selStr = "SELECT top(1000) StartDateTime, EndDateTime, ProcedureCode, PatientID, SessionID, ActivityID FROM ProtomTiming ";
    if (this .procedureCode > 3)                                          // select particular ProcedureCode
     selStr += " WHERE ProcedureCode = '" + this .procedureCode + "' AND StartDateTime > '2020-11-15' ORDER By ActivityID desc";
    else                                                                  // take ALL ProcedureCodes
      selStr += " WHERE  StartDateTime > '2020-11-15' ORDER By ActivityID desc";
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
    console.log("190 this.data is %o", this .data);
  }
  public stackedBins: any;                                                      // the holder for the stacked timeInterval bins
//  public toSeePatID: string;

  binData(){
    this .stackedBins = new Array();                                           // the holder for the stacked timeInterval bins
    var i = 0;

    var patCount2 = 0;                                                          // counter => index for patientLoop
    if ( this .data['Patients']  ){                                             // If there ARE patients

      for (let key of Object.keys(this .data['Patients'])) {                    // loop through the Patients
                  /////////  create a set of timeInterval bins for each patient, .g. 0->5, 5->10 ...  \\\\\\\\\\\\\\\\\\\\\
        var tstObj = {'name': key, 'data': []}                                  // make an object to hold the patient bin data
        this .stackedBins.push(tstObj);                                         // push the object into the main array;
        var binCount2 = 0;                                                      // counter => index for bin loop
        for (let binEntry of this .binsC)                                       // loop thru the Created Bins
          this .stackedBins[patCount2].data[binCount2++] = 0                    // create the bin with count = 0

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
    }
    this .binByProceedureCode();
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
  binByProceedureCode(){
/*********   DICOM Procedure codes.  Will drow any Activities with that ProcedureCode in the bin,i.e. increment n   */
this .procStr = {
  '121704':
  {'Description':'RT Position Acquisition single plane kV', 'code':'121704', 'n':0},
  '121705':
  {'Description':'RT Position Acquisition dual plane kV', 'code':'121705', 'n':0 },
  '121707':
  {'Description':'RT RT Position Acquisition CT kV', 'code':'121707', 'n':0 },
  '121726':
  {'Description':'RT Treatment with Internal Verification', 'code':'121726', 'n':0 },
  '121787':
  {'Description':'RT Patient Position Registration 2D on 3D Reference', 'code':'121787', 'n':0 },
  '99I001':
  {'Description':'Patient Position Acquisition Fluoroscopy 2DkV', 'code':'99I001`', 'n':0 },
  '99I002':
  {'Description':'Patient Position Acquisition Fluoroscopy CBCT ', 'code':'99I002`', 'n':0 },
  '99I003':
  {'Description':'RT Position Acquisition single plane CBCT', 'code':'99I003`', 'n':0 },
  }
  var count = 0;
  for (let entry of this .data.Rdata){
    if (count++ == 0)
      console.log("297  " + entry)
  }

  }                                                                      // end of binData function

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
               /////////// make a bin forEach Proceedure  \\\\\\\\\\\\\\\\\\\\
  public procBins: any;
  makeProcedureBins(){
    var i = 0;
    this .procBins = [];
    }

   setDurationErrorBar(){
  //   this .options.xAxis.categories = ['1', '2', '3', '4'];
     this .options3.xAxis.categories = this .data.categoriesForAv;
     this .options3.xAxis.labels ={};                                          // don't format as Date. 
     this .options3.series =[{
      name: 'Duration',
      color: '#4572A7',
      type: 'column',
      data: this .data['average']
  }, {
      name: 'Duration error',
      type: 'errorbar',
      data: this .data['error']
  }]
     Highcharts.chart('container', this .options3);                     // Draw top graph scatter plot
   }
 setDurationByDate(){
      ////////     Load data into  Top Graph scatter plot       \\\\\\\\\\\\\\\\\\\
      var i = 0;
      for (let key of Object.keys(this .data['Patients'])) {                    // loop through the Patients
        this .options.series[i] = [];
        this .options.series[i]['name'] = key;
        this .options.series[i]['data'] = this .data['Patients'][key];
        i++;
      }
      this .options.xAxis['categories'] = null;
      Highcharts.chart('container', this .options);                     // Draw top graph scatter plot
 }  
}
