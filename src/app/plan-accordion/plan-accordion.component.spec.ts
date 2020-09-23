import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanAccordionComponent } from './plan-accordion.component';

describe('PlanAccordionComponent', () => {
  let component: PlanAccordionComponent;
  let fixture: ComponentFixture<PlanAccordionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlanAccordionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanAccordionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
