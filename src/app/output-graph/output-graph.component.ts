import { FormControl } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';
import { GenService } from '../gen.service';
import { throwMatDialogContentAlreadyAttachedError } from '@angular/material';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { keyframes } from '@angular/animations';
import { ActivatedRoute, RouterLinkWithHref } from '@angular/router';
import * as moment from 'moment';

import { Inject }  from '@angular/core';
import { DOCUMENT } from '@angular/common';
import * as saveAs from 'file-saver';
import { map, retry, catchError } from 'rxjs/operators';
import exporting from 'highcharts/modules/exporting';
import { HttpClient } from '@angular/common/http';
import { Title } from '@angular/platform-browser';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
exporting(Highcharts);


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
 // urlBase: string;
  chart: any;
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
  locStart: string;
  setOptions: any;
  blob: Blob;
  options3: any;
  totalActivities: number;
  startDate: FormControl;
  endDate: FormControl;
  param1:string;
  constructor(private genSvce: GenService, private route: ActivatedRoute, @ Inject(DOCUMENT) document, private http: HttpClient) {
  //  this .selected = "Treatment";
    this .route.queryParams.subscribe(params => {
      this .param1 = params['param'];
      });
  }
  ngOnInit() {
   this .procedureCode = 121726;
   this .setOptions = this .options;
   this .locStart = moment().subtract(30, 'd').format('YYYY-MM-DD');
   this .getData(null, null)                                 // set for 'Treatment'
   this .genSvce.setPlatform();
   this .startDate = new FormControl();
   this .endDate = new FormControl();
   this .options.title.text = "Plans for Past 30 Days"
 //   this .detectDivChanges();
  }
  modalString1 = ''; modalString2 = '';
  showProcedure(ev){
    console.log('41' + ev);
  }

  detectDivChanges() {                                                  // detects that user has clicked on a Point on the graph changed
    const div = document.getElementById('vidx');
    const config = { attributes: true, childList: true, subtree: true };
    const observer = new MutationObserver((mutation) => {
    var index = document.getElementById("vidx").textContent;
    if (index.length > 3){
      index = index.slice(0, -3);
      index = index.slice(9);
      var modal = document.getElementById('detailModal');
      modal.style.display = "block";
    }
      console.log("div style changed" + index + "procCode %o", this .data.PCode[index])
    })
    observer.observe(div, config);
  }
  showAvStdDev(ev){
    var modal = document.getElementById('myModal');
    modal.style.display = "block";
    var av = this .data.average[ev.target.userOptions.name];
    this .modalString1 = "Average = " + this .data.averageByKey[ev.target.userOptions.name] + " min";
    this .modalString2 ="Standard Deviation = " + this .data.sigma[ev.target.userOptions.name] + " min";
  }
  closeModal(){
    var modal = document.getElementById('myModal');
    modal.style.display = "none";
  }
  closeDetailModal(){
    var modal = document.getElementById('detailModal');
    modal.style.display = "none";
  }
  titlePhrase: string;
  //////////   set parameters for Duration by Procedure graph  \\\\\\\\\\\\\\
    public options: any = {
      chart: {
        type: 'scatter',
        height: 400
      },
      title: {
        text: this .titlePhrase
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
                    return false ;
                  }.bind(this )    // !!!!!!allows acces to outside functions.
              },
        }
      },
      xAxis: {
        labels: {
          formatter: function () {
            return Highcharts.dateFormat('%e %b %y', this .value);
          }
        }
      },
      yAxis: {
        min: 0,
        title: {
            text: 'Duration [Minutes]'
          },
      },
      tooltip: {
        formatter: function (){
          return  Highcharts.dateFormat('%e %b ', this .x) + " duration:" + this .y + " minutes. "  ;
        }
      },
      series: [{}]                                // data is loaded in the binData() function
    }
    /*******
     *  bottom graph histogream by duration.
     */
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
        format: "test",
        },
      yAxis: {
        min: 0,
        title: {
            text: 'Procedures'
          },
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
      tooltip: {
        formatter: function (){
          return   this .y + " Plans. "  ;
        }
      },
      series: []
    }

    procStr: any

  setDurationErrorBar(){
    document.getElementById('container3').style.display = 'block';
    document.getElementById('container').style.display = 'none';
     }
  setDurationByDate(){
    document.getElementById('container3').style.display = 'none';
    document.getElementById('container').style.display = 'block';
    }
  setProcedureCode(n){
    this .procedureCode = n;
    this .getData(null, this .procedureCode)
  }
  startDateString: string;
  endDateString: string;
  editDate(type: string, event){
    if (type == 'start')
      this .startDateString = moment(event).format('YYYY-MM-DD');
    if (type == 'end')
      this .endDateString = moment(event).format('YYYY-MM-DD');
    if (this .startDateString && this .endDateString){
      this .options.title.text = "Plans from " + this .startDateString + " to " + this .endDateString
      this .getData(this .startDateString, this .endDateString)
    }
  }
  setDateRange(str){
    let start: string = '';
    let  today:string = moment().format('YYYY-MM-DD');
    if (str =='last20')
      start = moment().subtract(20, 'd').format('YYYY-MM-DD');
    if (str =='last30')
      start = moment().subtract(30, 'd').format('YYYY-MM-DD');
    if (str =='Epoch')
     start = '2020-01-02';
    this .getData(start, null);
   // this .setDurationErrorBar()
  }
   ////////////  make the bins and bin the data       \\\\\\\\\\\\\\
  setBinSize(n){
    this .binSizeC = n;
    this .makeBins();                                                     // make the bins
 //  this .makeProcedureBins()                                             // make the bins for the Procedures
    this .binData();                                                      // bin the data

    Highcharts.chart('container2', this .options2);                       // redo the Graph with new binSize
  }
 // downloadCsv() {
 //   this .chart.downloadCSV()
 // }
/**
 * gets data from dataBase
 * @param start 
 * @param end 
 */
  getData(start, end){
    let locStart = moment().subtract(30, 'd').format('YYYY-MM-DD');
    if (start)
      locStart = start;
    this .genSvce.setPlatform();                                            // switch Dev = BB or Prod = 242
    var selStr = "SELECT top(1000) StartDateTime, EndDateTime, ProcedureCode, PatientID, SessionID, ActivityID FROM ProtomTiming ";
    if (this .procedureCode > 3)                                          // select particular ProcedureCode
      selStr += " WHERE ProcedureCode = '" + this .procedureCode + "' AND StartDateTime >= '" +
       locStart + "' ORDER By ActivityID desc";
    else                                                                  // take ALL ProcedureCodes
      selStr += " WHERE  StartDateTime > '"+locStart+"' ORDER By ActivityID desc";

    this .genSvce.getWithSelString(selStr, locStart, this. procedureCode ).subscribe (
        (res) => {
          this .setData(res);                                               // store the data
          this .makeBins();                                                 // make Histogram bins
          this .binData();                                                  // put the data in bins
          this .makeNonStackedBins(res['Rdata'])
        this .options3=
        {
            series : [{
              name: 'Average Duration [minutes] ',
              color: '#4572A7',
              type: 'column',
              data: this .data['average'],
              }, {
              name: 'Duration error',
              type: 'errorbar',
              data: this .data['error']
              },
            ],
            xAxis :{
              categories: this .data['categoriesForAv'],
            },
            yAxis: {
              title: {
                text:'Duration [minutes]'}
            },
            title: {
              text: 'Patient Duration Average and Standard Deviation'
            },
        }
        Highcharts.chart('container', this .options);                     // Draw top graph scatter plot
        Highcharts.chart('container3', this .options3);                     // Av Duration Column plo
        Highcharts.chart('container2', this .options2);                   // Draw bottom graph Histogram

        },
        err => {
          console.log(err);
        }
      );                                                                // end of subscribe
    }


  setData(inpData){
    this .data = inpData;
    this .totalActivities = inpData.total;
    console.log("setData 288 %o", this .data)

  }
  public stackedBins: any;                                                      // the holder for the stacked timeInterval bins
//  public toSeePatID: string;
/**
 * Store the data in the 'series' for the 2 Upper Graphs. Make the bins for the Duration Historam in Lower Graph
 */
  binData(){
    this .stackedBins = new Array();                                           // the holder for the stacked timeInterval bins
    let plainBins =this .binsC;
    console.log("323 plainBins %o ", plainBins)
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
              plainBins[binCount2]['count']++;
            }
            binCount2++;
          }
        }
        patCount2++;
      }
      console.log("348  staBi %o", plainBins)
      let test = Array("stri2,","str3,")
      let tBlob = new Blob(test)
      console.log("349 blob %o", tBlob)
    //  saveAs(tBlob, 'hist.csv')
    }
    ////////     Load data into  Top Graph scatter plot       \\\\\\\\\\\\\\\\\\\
    var i = 0;
    this .options.series = Array();                                           // clear old data
    for (let key of Object.keys(this .data['Patients'])) {                    // loop through the Patients
            this .options.series[i] = [];
            this .options.series[i]['name'] = key;
            this .options.series[i]['data'] = this .data['Patients'][key];
            i++;
          }
    ////////    Load data into Bottom Graph Histogram       \\\\\\\\\\\\\\\\\\\\
    this .options2.series = this .stackedBins;                                // load the data into lower graph
    this .options2.xAxis['categories'] = this .binsC['Label'];
  }                                                                           // end of bidData
                                                                  // end of binData function
/**
 * Make the bins for the lower graph histogram
 */
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
    console.log("383 binsC %o", this .binsC)
   }

  makeNonStackedBins(data){
    let simpleBins = [];
    var maxDurationExpected = 60;
 
    let k: keyof typeof data;
    for (k in data){
      let binNum = +(data[k][1] / this.binSizeC).toFixed()
      if (!simpleBins[binNum])
        simpleBins[binNum] = 1;
      else
        simpleBins[binNum] += 1;
    //  console.log(data[k][1], binNum )
    }
    console.log("401 simpleVins %o", simpleBins)

  }

  /**
   * Saves a .csv file of the data. 
   */
  saveFile(){
    this.getFile().subscribe((res) => {
      this .data = res;
      this .blob = new Blob([this .data], {type: 'application/csv'});
      saveAs(this .blob, 'PlanData.csv')
    });
    console.log('fileSaved')
  }
  // download.service.ts
  getFile() {
    const httpOptions = {
      responseType: 'blob' as 'json'
    };
    return this .http.get(`${this .genSvce .urlBase}/log/CSVtimeInterval.csv`, httpOptions);
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
      } 
      public procBins: any;
      makeProcedureBins(){
        var i = 0;
        this .procBins = [];
        }   
}
