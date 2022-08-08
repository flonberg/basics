import { Component, OnInit } from '@angular/core';
import { GenService } from '../gen.service';


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
  WFData: any; 
  constructor(private genSvce: GenService) {
    this .genSvce = genSvce;
   }

  ngOnInit() {
    this .getData();
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
