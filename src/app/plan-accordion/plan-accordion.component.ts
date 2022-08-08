import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GenService } from '../gen.service';
import * as Highcharts from 'highcharts';


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
  public options

  userid: string;
  constructor(private genSvce: GenService, private route: ActivatedRoute) {
    this .genSvce = genSvce;
   }
  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.userid = params.userid
      this .genSvce.getParams(params.userid).subscribe(
        (res) => {
          this .genSvce.WFargs = res;
          console.log("32 gggg WFargs %o", this .genSvce.WFargs)
          this .genSvce.getWFdata().subscribe(
            (wres) => {
              this .WFdata = wres
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
             // this .gotData = true
        
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
