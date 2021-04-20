import { GenService } from './../gen.service';
import { FormControl } from '@angular/forms';
import {MatChipsModule} from '@angular/material/chips';
import { Component, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';


import { ActivatedRoute, RouterLinkWithHref } from '@angular/router';
import * as moment from 'moment';

import { Inject }  from '@angular/core';
import { DOCUMENT } from '@angular/common';
import * as saveAs from 'file-saver';

import exporting from 'highcharts/modules/exporting';
import { HttpClient } from '@angular/common/http';

import { interval } from 'rxjs';
import { instantiateSupportedAnimationDriver } from '@angular/platform-browser/animations/src/providers';
exporting(Highcharts);


declare var require: any;
let Boost = require('highcharts/modules/boost');
let noData = require('highcharts/modules/no-data-to-display');
let More = require('highcharts/highcharts-more');

Boost(Highcharts);
noData(Highcharts);
More(Highcharts);
noData(Highcharts);

export interface sessiontInt {
  IDLE: number,
  CONTINUED: number,
  ENDED: number,
  INPROGRESS: number,
  CANCELED: number,
  fromDate: string
}

@ Component({
  selector: 'app-output-graph',
  templateUrl: './output-graph.component.html',
  styleUrls: ['./output-graph.component.css']
})
export class OutputGraphComponent implements OnInit {
  private customDates = false;                                           // only set to true if user selects
  private dateRan = "Today";
  private expTime = '';
  private data: any;
  private procedureCode: number;
  private binSizeC: number = 5;                                                 // default number of minutes per bin
  private binsC: any
  private numInBin: any;
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
  currentSessions: any;
  numContinued: number;
  currSess: sessiontInt;
  byPatData: any;

  constructor(private genSvce: GenService, private route: ActivatedRoute, @ Inject(DOCUMENT) document,
   private http: HttpClient) {
    this .route.queryParams.subscribe(params => {
      this .param1 = params['param'];
      });
  }
  ngOnInit() {
   this .currSess =  { 'CONTINUED' : 0, 'IDLE' :0, 'ENDED' :0, 'INPROGRESS':0 , 'CANCELED': 0, 'fromDate':''}
   this .procedureCode = 121726;                                                // default sessionType is 'Treaement' 
   this .setOptions = this .options;
   this .locStart = moment().subtract(1, 'month').format('YYYY-MM-DD');            // default it 1 Month back
   this .getData()                                 // set for 'Treatment'
   this .genSvce.setPlatform();
   this .startDate = new FormControl();
   this .endDate = new FormControl();
   this .startDateString = moment().subtract(1, 'month').format('YYYY-MM-DD');            // default it 1 Month back
   this .endDateString = moment().format('YYYY-MM-DD');
   // Create an Observable that will publish a value on an interval
   const secondsCounter = interval(1000000);
   this .getSessions(0, null)

// Subscribe to begin publishing values
  this .getData();
   secondsCounter.subscribe(n => {
    this .getSessions(0, null)
    });
 //   this .detectDivChanges();
  }
  modalString1 = ''; modalString2 = '';
  getSessions(num, arg){
    this .currentSessions = null;
    this .genSvce .getSessions(num, arg). subscribe(
      (res=> {
        this .setSessions(res);
      })
    )
  }
  setSessionRange(num, arg){
    if (arg == 'year' || arg ==  'all')
      this .expTime = "... about 15 seconds"
    if (arg == 'month' && num == '6')
      this .expTime = "... about 10 seconds"
    this .getSessions(num, arg)
  }
  /**
   * Sets the dates for the data collection, which are then put in the SELECT string argument 
   * @param n 
   * @param str 
   */
  setDateRange(n, str){
    let start: string = '';
    let  today:string = moment().format('YYYY-MM-DD');                          // set end of data collection interval
    if (n > 0 )      {                                                           // user wants to back n e.g. months
      this .startDateString = moment().subtract(n, str).format('YYYY-MM-DD');   // go back as required
      this .startDate.setValue(this .startDateString);
      this .endDate.setValue(moment().format('YYYY-MM-DD'));
    }
      if (str =='Epoch')                                                          // user wants ALL data
      this .startDateString  = '2020-01-02';
    this .endDateString =moment().format('YYYY-MM-DD')
    this .options.title.text = "Plans from " + this .startDateString + " to " + this .endDateString   // set title for graph
    this .getData();
  }
  setSessions(sess){
    this .currentSessions = sess;
    this .currSess.CONTINUED = sess.CONTINUED;
    this .currSess.IDLE = sess.IDLE;
    this .currSess.ENDED = sess.ENDED;
    this .currSess.INPROGRESS = sess.INPROGRESS;
    this .currSess.CANCELED = sess.CANCELED;
    this .currSess.fromDate = sess.fromDate;
    console.log("88 currentSessions %o", sess)
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
        text: 'Activity Duration '
      },
      subtitle: {  title: {
        text: this .titlePhrase
      },
        text: 'test'
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
            return Highcharts.dateFormat(' %b %e  ', this .value);
          }
        },
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
        text: 'Histogram of Activity Duration'
      },
      yAxis: {
        min: 0,
        title: {
            text: 'Procedures'
          },
      },
      xAxis: {
        title:{
          text: 'Bin Size [minutes]'
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
    this .getData()
  }
  startDateString: string;
  endDateString: string;
  editDate(type: string, event){
    if (type == 'start'){
      this .startDateString = moment(event).format('YYYY-MM-DD');
      this .dateRange = "Custom"
    }
    if (type == 'end')
      this .endDateString = moment(event).format('YYYY-MM-DD');
    if (this .startDateString.length > 2 && this .endDateString.length > 2 ){
      this .options.title.text = "Plans from " + this .startDateString + " to " + this .endDateString
      this .getData()
    }
  }

   ////////////  make the bins and bin the data       \\\\\\\\\\\\\\
  setBinSize(n){
    this .binSizeC = n;
    this .makeBins();                                                     // make the bins
 //  this .makeProcedureBins()                                             // make the bins for the Procedures
    this .binData();                                                      // bin the data

    Highcharts.chart('container2', this .options2);                       // redo the Graph with new binSize
  }
/**
 * gets data from dataBase
 * @param start
 * @param end
 */
  getData(){
    this .genSvce.setPlatform();                                            // switch Dev = BB or Prod = 242
    var selStr = "SELECT top(1000) StartDateTime, EndDateTime, ProcedureCode, PatientID, SessionID, ActivityID FROM ProtomTiming ";
    if (this .procedureCode > 3)     {                                     // select particular ProcedureCode
      selStr += " WHERE ProcedureCode = '" + this .procedureCode + "' AND StartDateTime >= '" +    this .startDateString+ "'";
     // if (end)
        selStr += " AND StartDateTime <= '"+    this .endDateString+ "'";
    }
    else       {                                                         // take ALL ProcedureCodes
    selStr += " WHERE (ProcedureCode = '121726' OR ProcedureCode= '121733' OR ProcedureCode = '121724') AND StartDateTime >= '" +    this .startDateString+ "'";
       selStr += " AND StartDateTime <= '"+    this .endDateString+ "'";
  }

    console.log(" 330 selStr is " + selStr)
    this .genSvce.getWithSelString(selStr, this .startDateString, this. procedureCode ).subscribe (
        (res) => {
          this .setData(res);                                               // store the data
          this .makeBins();                                                 // make Histogram bins
          this .binData();                                                  // put the data in bins
          this .makeNonStackedBins(res['Rdata'])
        this .options3=                                                 // set options for the Avereage/StdDev plot
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
            subtitle: {
              text: this .data['total'] + ' Plans'
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
    console.log("in setData %o", this .data)
    this .totalActivities = inpData.total;
    this .byPatData = inpData.Patients
    this .options.subtitle.text = inpData.total + " Plans "
    if (this .startDateString && this .endDateString)
      this .options.title.text = "Plan Duration ";
  }
  public stackedBins: any;                                                      // the holder for the stacked timeInterval bins
  public plainBins: []
/**
 * Store the data in the 'series' for the 2 Upper Graphs. Make the bins for the Duration Historam in Lower Graph
 */
  binData(){
    this .stackedBins = new Array();                                           // the holder for the stacked timeInterval bins
    this .plainBins =this .binsC;
    console.log("323 plainBins %o ", this .plainBins)
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
              this .stackedBins[patCount2]['data'][binCount2]++                 // increment the count in that bin
              this .plainBins[binCount2]['count']++;
            }
            binCount2++;
          }
        }
        patCount2++;
      }
    }
    ////////     Load data into  Top Graph scatter plot       \\\\\\\\\\\\\\\\\\\
    var i = 0;
    this .options.series = Array();                                           // clear old data
    if (this .data['Patients'])
    for (let key of Object.keys(this .data['Patients'])) {                    // loop through the Patients
            this .options.series[i] = [];
            this .options.series[i]['name'] = key;
            this .options.series[i]['data'] = this .data['Patients'][key];
            i++;
          }
    ////////    Load data into Bottom Graph Histogram       \\\\\\\\\\\\\\\\\\\\
    this .options2.series = this .stackedBins;                                // load the data into lower graph
    this .options2.xAxis['categories'] = this .binsC['Label'];
 //   this .savePatHistogram(this .stackedBins, plainBins)
  }
  saveDurationCSV(data){
    let dArray = Array();                                                   // array for the lines of the CSV file
    let i = 0;                                                              // line index
    dArray[i] = Array();                                                    // create the array for the line
    dArray[i][0] = "Duration [min] \r\n"
    dArray[++i] = Array();
    dArray[i][0] = "Plans from " + this .startDateString;
    if (this .endDateString)
      dArray[i][0] += " to " + this .endDateString + "\r\n";
    i++;
    for (let key of Object.keys(data)){                                     // step through the patient lines
        dArray[i] = Array();                                                  // create the array for the line
        dArray[i][0] = key                                      // store the PatientID in the first col
        let k = 1;                                                            // index of data lines
        for (let entry of data[key]){
          dArray[i][k++] = entry[1]
        }
        dArray[i][k++] = "\r\n"                                               // line feed to end the line
        i++;                                                                  // go to the next line
      }
      console.log("384 patDate %o", dArray)
      let tBlob = new Blob(dArray)
      saveAs(tBlob, 'duration.csv')                                               // Save the file
  }
  /**
   * Save the Histogram data to file.
   * @param data
   * @param totals
   */                                                                        // end of bidData
  savePatHistogram(data, totals){
    let dArray = Array();                                                   // array for the lines of the CSV file
    let i = 0;                                                              // line index
    dArray[i] = Array();                                                    // create the array for the line
    dArray[i][0] = "Plans from " + this .startDateString;
    if (this .endDateString)
      dArray[i][0] += " to " + this .endDateString;
    dArray[i][0] += " Bin Size = " + this .binSizeC + " minutes"
    dArray[i][0] += "\r\n";
    i++;
    for (let key of Object.keys(data)){                                     // step through the patient lines
      dArray[i] = Array();                                                  // create the array for the line

      dArray[i][0] = data[key]['name']                                      // store the PatientID in the first col
      let k = 1;                                                            // index of data lines
      for ( let entry of data[key]['data']){                                // step thru each patient count
        dArray[i][k++] = entry                                              // store the datum
      }
      dArray[i][k++] = "\r\n"                                               // line feed to end the line
      i++;                                                                  // go to the next line
    }
    dArray[i] = Array();                                                    // make the line for the totals
    dArray[i][0] = "Total";                                                 // put 'Total' in first col
    let k = 1;                                                              // index for the cols
    for (let key of Object.keys(totals)){
      dArray[i][k++] = totals[key]['count'];                                // store the datum
    }
    let tBlob = new Blob(dArray)
    saveAs(tBlob, 'hist.csv')                                               // Save the file
  }

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

/*
  saveFile(){
    this.getFile().subscribe((res) => {
      this .data = res;
      this .blob = new Blob([this .data], {type: 'application/csv'});
      saveAs(this .blob, 'PlanData.csv')
    });
    console.log('fileSaved')
  }
  */
/**
 * Get a file from the Server
 */
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
