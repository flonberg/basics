import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatSelectModule} from '@angular/material/select';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatRadioModule} from '@angular/material/radio';
import {MatInputModule, MatInput} from '@angular/material/input';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { RouterModule } from '@angular/router';
import {MatExpansionModule} from '@angular/material/expansion';

import { MatGridListModule, MatDatepicker, MatNativeDateModule } from '@angular/material';





import { AppComponent } from './app.component';

import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ExpandRowsComponent } from './expand-rows/expand-rows.component';
import { PlanAccordionComponent } from './plan-accordion/plan-accordion.component';
import { OutputGraphComponent } from './output-graph/output-graph.component';

@ NgModule({
  declarations: [
    AppComponent,
    OutputGraphComponent,
    ExpandRowsComponent,
    PlanAccordionComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatSelectModule,
    MatGridListModule,
    MatRadioModule,
    MatInputModule,
    MatNativeDateModule,
    MatDatepickerModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    MatAutocompleteModule,
    RouterModule.forRoot([

      { path: '**', component: PlanAccordionComponent}
    ])

  ],
  providers: [
    MatDatepickerModule, 
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
