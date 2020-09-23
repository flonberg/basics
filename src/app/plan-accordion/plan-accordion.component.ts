import { Component, OnInit } from '@angular/core';


@Component({
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
  constructor() { }

  
  ngOnInit() {
  }
  setPatients(res){
    const patients = res;
    console.log("pasritnet is  %o", patients);
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
