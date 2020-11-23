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
  procedureCode: string;
  binSizeC: number = 10;
  binsC: any
  numInBin: any;

  ngOnChanges(){
    console.log("change")
    this .getData('121726')
  }
 // ngDoCheck(ev) {
 //   console.log('Docheck %o' + ev);
 // }

  ngOnInit() {
    const observer = new MutationObserver(mutation => {
      console.log('DOM mutation detected');
      this.handleDomChange(mutation)
    });
    const tNode = document.getElementById('vidx2')
    observer.observe(tNode, {
      childList: true,
      attributes: true,
      subtree: true,
      characterData: true
    });
  //  const targetNode = document.getElementById('vidx2');                        // Select the node that will be observed for mutation

    this .getData('121726');                                                // set for 'Treatment'
    var myFunction=()=> {
      alert("myFunction is now properly executed");
   }
  }
  handleDomChange(ev){
    console.log("event %", ev);
  }
  
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
                //  this .myFunction();
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
    observer:any;
    param1:string;
  constructor(private genSvce: GenService, private route: ActivatedRoute) {
    this .selected = "Treatment";
    this.route.queryParams.subscribe(params => {
      this.param1 = params['param'];
      console.log("157 param1 is %o", this.param1)

  });
   }
   ngAfterViewInit() {
    this.observer = new MutationObserver(mutations => {
      mutations.forEach(function(mutation) {
        console.log(" 8888 " + mutation.type);
      });   
    });
  //  var config = { attributes: true, childList: true, characterData: true };

  //  this.observer.observe(this.elRef.nativeElement, config);
  }

  setBinSize(n){
    this .binSizeC = n;
    this .makeBins();
    this .binData();

    Highcharts.chart('container2', this .options2);

  }
  getData(code){
    console.log("164");
    this .procedureCode = code;                                             // code -> e.g 121726 = Treatment
    this .genSvce.setPlatform();                                            // switch Dev = BB or Prod = 242
    this .options.series = [];
    var selStr = "SELECT StartDateTime, EndDateTime, ProcedureCode, PatientID FROM ProtomTiming ";
    if (+code > 0 )
      selStr += " WHERE ProcedureCode = " + code
    this .genSvce.getWithSelString(selStr  ).subscribe (
        (res) => {
          this .setData(res);                                               // store the data
          this .makeBins();                                                 // make Histogram bins
          this .binData();
      //    this .make2dBins();
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
  public tst: any;
  public tst2: any;
  public toSeePatID: string;
  binData(){
    this .tst = new Array();
    this .tst2 = new Array();
    var i = 0;
    var oLoopCount = 0;
    var keyCount = 0;
    for (let key of Object.keys(this .data['Patients'])) {                    // loop through the Patients

      console.log("212 key is %o", key);
      for (let key2 of  this .data['Patients'][key] ){                        // loop thru the patients Session Durations
        var binCount = 0;                                                     // the index of the bin, e.g first, second, third ...
        for (let entry of this .binsC ){                                      // loop thry the bins

          this .tst[binCount] = new Array();

          if (  key2[1] > entry[0] && key2[1]   <= entry[1] ){                // if the Duration is in the bin
      
            if (!this .tst[binCount][key]){
              this .tst[binCount][key] = 1;

            }
            this .numInBin[binCount]++                                        // increment the count in the bin

          }
          binCount++;                                                         // go to the next bin

        }
      }
////////      Top Graph scatter plot       \\\\\\\\\\\\\\\\\\\
      this .options.series[i] = [];
      this .options.series[i]['name'] = key;
      this .options.series[i]['data'] = this .data['Patients'][key];
////////      Bottom Graph Histogram       \\\\\\\\\\\\\\\\\\\\
      this .options2.series[0] = [];
      this .options2.series[0]['name'] = 'Minutes';
      this .options2.series[0]['data'] = this .numInBin;
      this .options2.xAxis['categories'] = this .binsC['Label'];
      i++;

    }
/////////  make the bins for each patient  \\\\\\\\\\\\\\\\\\\\\    
    var patCount2 = 0;
    for (let key of Object.keys(this .data['Patients'])) {                    // loop through the Patients
      var tstObj = {'name': key, 'data': []}                                  // make an objest to hole the patient bin data
      this .tst2.push(tstObj);
      var binCount2 = 0;                                                       // push the object into the main array;
      for (let binEntry of this .binsC){
   //     console.log("253 binEntry is %o", binEntry);
        this .tst2[patCount2].data[binCount2++] = 0
      }
      patCount2++;
    }
    var patCount2 = 0;
    for (let key of Object.keys(this .data['Patients'])) {                    // loop over patients

      console.log("253 key is %o pardata is %o", key, this .data['Patients'][key])
      for (let entry of this .data['Patients'][key]) {                        // loop over each patient's durations
        console.log(entry[1]); // 1, "string", false
        var binCount2 = 0;
        for (let binEntry of this .binsC ){
          if (entry[1] > binEntry[0] && entry[1] <= binEntry[1]){
     //       console.log("257 bincC endty is %o duration is %o this bin has %o", binEntry[0],  entry[1], this .tst2)
            this .tst2[patCount2]['data'][binCount2]++
          }
          binCount2++;
        }
      }
      patCount2++;
      console.log("tst2 is %o ", this .tst2)
    //  break;
    }

 
  }

  makeBins(){
    this .binsC = [];                                                         // create the array of bins
    this .numInBin = [];


    this .binsC['Label'] = [];
    var numBins = 60 / this .binSizeC;                                        // create max number of bins = longestExpectedTime / numBins
    for (let i = 0; i < numBins; i++) {
      this .binsC[i] = [i * this .binSizeC, (i + 1) * this .binSizeC];        // set lower and upper bounds for each bin.
      this .binsC['Label'][i] = i * this .binSizeC + " to " +( i + 1) * this .binSizeC;   // the label for the bin in the graph
      this .binsC[i]['count'] = 0;                                            // make the bin.
      this .numInBin[i] = 0;                                                  // zero out the count in each bin. 
    }
   }
   bins2C: any;
   num2InBin = [[]];
   patCount = 4;
 make2dBins(){
  var numBins = 60 / this .binSizeC;                                        // create max number of bins = longestExpectedTime / numBins
  this .bins2C =[this .numInBin] ;                                                         // create the array of bins
  this .num2InBin = new Array(new Array());
    for (let i = 0; i < numBins; i++) {
      for (let j = 0; j < this .patCount; j++ ){
        if (!this .bins2C[i])
          this .bins2C[i] = new Array();
          this .bins2C[i][j]  = [i * this .binSizeC, (i + 1) * this .binSizeC];        // set lower and upper bounds for each bin.
//          this .bins2C[i][j]  = [i * this .binSizeC, (i + 1) * this .binSizeC];        // set lower and upper bounds for each bin.
        }
      }
      console.log("254  bins2C is %o", this .bins2C)
 }
}
