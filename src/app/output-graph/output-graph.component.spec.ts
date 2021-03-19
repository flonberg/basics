import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OutputGraphComponent } from './output-graph.component';

import { MatInputModule, MatSelectModule, MatLabel, MatOption, MatFormField } from '@angular/material/';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('OutputGraphComponent', () => {
  let component: OutputGraphComponent;
  let fixture: ComponentFixture<OutputGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatInputModule,
        MatSelectModule,
        MatLabel,
        MatOption,
        MatFormField
      ],
      declarations: [ OutputGraphComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));



  beforeEach(() => {
    fixture = TestBed.createComponent(OutputGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should have date', () => {
    expect(component['endDate']).toBeTruthy();
  });
});
