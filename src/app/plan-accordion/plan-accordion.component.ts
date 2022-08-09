import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GenService } from '../gen.service';
import * as Highcharts from 'highcharts';
import { FormControl } from '@angular/forms';
import * as moment from 'moment';

interface DD {
  value: string;
  viewValue: string;
}
@ Component({
  selector: 'app-plan-accordion',
  templateUrl: './plan-accordion.component.html',
  styleUrls: ['./plan-accordion.component.css']
})
export class PlanAccordionComponent implements OnInit {
  heroes = [{'name':'Agiligy'}];
  bars = new Array(1);
  heading = false;
  headText = 'Measurement';
  headText2Bool = false;
  headText2 = 'QA Check';
  data: any;
  WFdata: any;
  gotData: boolean
  showCustomDates: boolean
  public options
  selectedSortBy: string
  startDate: FormControl;
  endDate: FormControl;
  sortingbyTerm: FormControl;
  serviceList: string[]
  dateRangeList: string[]
  startStageList: string[]
  endStageList: string[]
  sortBys: DD[] = [
    {value: 'Modality', viewValue: 'Modality'},
    {value: 'SiteDesc', viewValue: 'Service'},
    {value: 'MDKey', viewValue: 'Physician'},
  ];
  startStage: DD[] = [
    {value: 'ScanDate', viewValue: 'ScanDate'},
    {value: 'Contours and Prescription', viewValue: 'Contours and Prescription'},
    {value: 'Assign Dosimetrist', viewValue: 'Assign Dosimetrist'},
    {value: 'Treatment Planning', viewValue: 'Treatment Planning'},
    {value: 'Ready for MD', viewValue: 'Ready for MD'},
    {value: 'MD Approved', viewValue: 'MD Approved'},
    {value: 'Plan Write-up', viewValue: 'Plan Write-up'},
    {value: 'Pre-Treatment QA', viewValue: 'Pre-Treatment QA'},
  ];
  endStage: DD[] = [
    {value: 'Contours and Prescription', viewValue: 'Contours and Prescription'},
  ];
  relTimeRange: DD[] = [
    {value: 'Last Month', viewValue: 'Last Month'},
    {value: 'Last Two Months', viewValue: 'Last Two Months'},
    {value: 'Year to Date', viewValue: 'Year to Date'},
    {value: 'Custom Dates', viewValue: 'Custom Dates'},
  ];
  
  selectedStartStage = 'ScanDate'
  selectedEndStage = 'Contours and Prescription'
  selectedTimeRange = 'Last Month'


  userid: string;
  constructor(private genSvce: GenService, private route: ActivatedRoute) {
    this .genSvce = genSvce;
   }
  ngOnInit() {

    this .serviceList = ['Modality', 'Service', 'Physician']
    this .gotData = false
    this .showCustomDates = false
    this .startDate = new FormControl();
    this .endDate = new FormControl();
    this.route.queryParams.subscribe(params => {
      this.userid = params.userid
      console.log("79 usrid is %o", this.userid)
      this .genSvce.getParams(params.userid).subscribe(
        (res) => {
          this .genSvce.WFargs = res;
          this .selectedSortBy = 'Modality'
          console.log("32 gggg WFargs %o", this .genSvce.WFargs)
          this .genSvce.getWFdata().subscribe(
            (wres) => {
              this .WFdata = wres
              this .gotData = true
              console.log("36 eeee %o", this .WFdata)
              this .options = {
                plotOptions: {
                  column: {
                    stacking: 'normal'
                  }
                },
                chart: {
                  type: 'column',
                  height: 700
                },
                title: {
                    text: this. WFdata['count'] + " plans canvased, from " + this .WFdata['startDate'] + " to " + this .WFdata['endDate']
                },
                subtitle: {
                //  text: this. theSubTitle
                },
                credits: {
                  enabled: false
                },
                yAxis: {
                  title: {
                    text: 'Number of Plans',
                  },
                //  stackLabels: {
                  //  enabled: true,
                  //},
                },
                xAxis: {
                  title: {
                    text: 'Number of Days (bin)',
                  },
                  type: 'number',
                  labels: {
                    formatter: function() {
                      return  this.value;
                    }
                  },
                  categories: ['Apples', 'Oranges', 'Pears', 'Grapes', ]
                },
              }
              console.log("182 res is %o", res)
              this .options.series = this .WFdata['data']
              this .options.xAxis['categories'] = ['0','1','2','3','4','5','6','7'];
              Highcharts.chart('container', this.options);
                  //    this .showControls = true
            }
          )
        }
      )
      console.log("28 usrid fffff is %o", this .userid)
    })
  }
  getWFdata(){
    this .genSvce.getWFdata().subscribe(
      (wres) => {
        this .WFdata = wres
        this .options.series = this .WFdata['data'] 
        Highcharts.chart('container', this.options);
      })
  }
  submitFunc(){
    console.log("98 WFargs %o", this.genSvce.WFargs);
    this .getWFdata();
 //   this .getWFData() 
  /*  this .genSvce. saveWFparams().subscribe(
      (res)=>{
        let savedParams = res
        console.log("111 saveParams %o", savedParams)
      }
    );
    */

  }
    
  changeStartStage(e){
    console.log("142  changeStartStage %o ", e)
    if (e == 'ScanDate'){
      this .endStage = [{value: 'Contours and Prescription', viewValue: 'Contours and Prescription'},]
      this. selectedEndStage = 'Contours and Prescription'
      this .genSvce.WFargs['endWF'] = 'Contours and Prescription'
      this .genSvce.WFargs['startWF'] = 'ScanDate'
    }
    if (e == 'Assign Dosimetrist' ){
      this .endStage = [ {value: 'VSIM/StartDate', viewValue: 'CVSIM/StartDate'},]
      this. selectedEndStage = 'VSIM/StartDate'
      this .genSvce.WFargs['endWF'] = 'StartDate'
    }    
    if (e == 'Treatment Planning'){
      this .genSvce.WFargs['endWF'] = 'Start Date'
      this .endStage = [
        {value: 'Assign Dosimetrist', viewValue: 'Assign Dosimetrist'},
        {value: 'VSIM/Start Date', viewValue: 'VSIM/Start Date (updated'},
      ];
    }
    if (e == 'Contours and Prescription'){
        this .endStage = [
          {value: 'Ready for MD', viewValue: 'Ready for MD'},
          {value: 'MD Approved', viewValue: 'MD Approved'},
          {value: 'VSIM/Start Date', viewValue: 'VSIM/Start Date (updated'},
        ];
      }
    if (e == 'Ready for MD'){
      this .endStage = [
        {value: 'MD Approved', viewValue: 'MD Approved'},
        {value: 'VSIM/Start Date', viewValue: 'VSIM/Start Date'},
      ];
      }  
    if (e == 'MD Approved'){
      this .endStage = [
        {value: 'Plan Write-up', viewValue: 'Plan Write-up'},
        {value: 'VSIM/Start Date', viewValue: 'VSIM/Start Date'},
      ];
      }    
    if (e == 'Plan Write-up'){
      this .endStage = [
        {value: 'Physics Plan Check', viewValue: 'Physics Plan Check'},
        {value: 'Pre-Treatment QA', viewValue: 'Pre-Treatment QA'},
        {value: 'VSIM/Start Date', viewValue: 'VSIM/Start Date'},
      ];
      }   
    if (e == 'Pre-Treatment QA'){
      this .endStage = [ {value: 'Physics Plan Check', viewValue: 'Physics Plan Check'},]
      this. selectedEndStage = 'Physics Plan Check'
      this .genSvce.WFargs['endWF'] = 'Physics Plan Check'
      console.log("213 WF has %o", )
    }       
  }
  setSortBy(e){
    console.log("193 setSortBy %o", e)
    this .genSvce.WFargs['sortBy'] = e
    console.log("193 setSortBy %o", this .genSvce.WFargs)
  }
  setRelTimeRange(e){
    console.log("142  changeStartStage %o ", e)
    if (e == "Custom Dates")
      this .showCustomDates = true
    else  
      this .showCustomDates = false
  }
  getData(){
    this .genSvce.setPlatform();
    //  this.genEditSvce.getPMDs('fjl3').subscribe(
        this  .genSvce.getWithSelString("SELECT StartDateTime, EndDateTime, ProcedureCode FROM ProtomTiming WHERE PatientID ='700-57-44' AND ProcedureCode = '121726'" ).subscribe (
        (res) => {
          this .setData(res);
        },
        err => {
          console.log("error 223");
          console.log(err);
        }
      );
    }

     
  setData(res){
    this .data = res;
    console.log("43  pasritnet is  %o", this .data);

  }
  addRow(){
    this .bars.push(1);
  }
  startDateString: string;
  endDateString: string;
  editDate(type: string, event){
    if (type == 'start'){
      this .startDateString = moment(event).format('YYYY-MM-DD');
     // this .dateRange = "Custom"
    }
    if (type == 'end')
      this .endDateString = moment(event).format('YYYY-MM-DD');
    if (this .startDateString.length > 2 && this .endDateString.length > 2 ){
      this .options.title.text = "Plans from " + this .startDateString + " to " + this .endDateString
      this .getData()
    }
  }
  setType(s){
    console.log('set', s.target.innerText);
    if (s.target.innerText == 'Mobius'){
      this .heading = true;
      this .headText2Bool = true;
      this .headText = "Plan Check";
    }
    else {
      this .heading = false;
      this .headText2Bool = false;
      this .headText = "Measurement";
    }
    
  }
}
