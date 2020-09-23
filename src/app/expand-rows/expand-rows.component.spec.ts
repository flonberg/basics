import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpandRowsComponent } from './expand-rows.component';

describe('ExpandRowsComponent', () => {
  let component: ExpandRowsComponent;
  let fixture: ComponentFixture<ExpandRowsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExpandRowsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpandRowsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
