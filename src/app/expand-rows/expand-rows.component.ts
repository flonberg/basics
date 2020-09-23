import { Component, OnInit } from '@angular/core';

@ Component({
  selector: 'app-expand-rows',
  templateUrl: './expand-rows.component.html',
  styleUrls: ['./expand-rows.component.css']
})
export class ExpandRowsComponent implements OnInit {

  bars = new Array(1);

  constructor() { }

  ngOnInit() {
  }
  addRow(){
    this .bars.push(1);
  }
  setType() {
    console.log('setType');

  }

}
