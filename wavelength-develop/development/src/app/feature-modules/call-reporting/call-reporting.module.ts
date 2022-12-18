import { CallReportingService } from './call-reporting.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatSliderModule } from '@angular/material/slider';
import { CallReportingComponent } from './call-reporting.component';
import { CallReportingRoutingModule } from './call-reporting-routing.module';

@NgModule({
  imports: [
    CommonModule,
    CallReportingRoutingModule,
    NgxDatatableModule,
    FormsModule,
    NgSelectModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    BsDatepickerModule.forRoot(),
    MatCardModule,
    MatSliderModule
  ],
  declarations: [
    CallReportingComponent
  ],
  providers: [CallReportingService]
})
export class CallReportingModule { }
