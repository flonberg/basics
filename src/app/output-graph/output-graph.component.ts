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

    ngOnInit() {
      const targetNode = document.getElementById('vidx');
      // Options for the observer (which mutations to observe)
const config = { attributes: true, childList: true, subtree: true };

// Callback function to execute when mutations are observed
const callback = function(mutationsList, observer) {
    // Use traditional 'for loops' for IE 11
    for(const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            console.log('A child node has been added or removed.');
        }
        else if (mutation.type === 'attributes') {
            console.log('The ' + mutation.attributeName + ' attribute was modified.');
        }
    }
};

// Create an observer instance linked to the callback function
const observer = new MutationObserver(callback);

// Start observing the target node for configured mutations
observer.observe(targetNode, config);

    this .getData('121726');                                      // set for 'Treatment'
    var myFunction=()=> {
      alert("myFunction is now properly executed");
   }
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
                  document.getElementById('vidx').innerText = ev.target.userOptions.name;     // load UserID to DOM
                  document.getElementById('container2').style.display = 'none';
                  document.getElementById('container2').style.display = 'block';
                  var url = window.location.href;
                        if (url.indexOf('?') > -1){                                          // if there IS already a param
                          url = url.split('?')[0]
                          url += '?param='+ ev.target.userOptions.name
                        }else{
                          url += '?param='+ ev.target.userOptions.name
                        }
               //   window.location.href = url;
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
  constructor(private genSvce: GenService) {
    this .selected = "Treatment";
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
  public toSeePatID: string;
  binData(){

    var i = 0;
    for (let key of Object.keys(this .data['Patients'])) {                    // loop through the Patients
      for (let key2 of  this .data['Patients'][key] ){                        // loop thru the patients Session Durations
        var binCount = 0;                                                     // the index of the bin, e.g first, second, third ...
        for (let entry of this .binsC ){                                      // loop thry the bins
          if (  key2[1] > entry[0] && key2[1]   <= entry[1] ){                // if the Duration is in the bin
          //  entry.count++;                                                  // increment that Bin count.
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

}
