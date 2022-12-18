import { CallAcknowledgePageComponent } from './call-acknowledge.page';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { CallAcknowledgeRoutingModule } from './call-acknowledge-routing.module';
import { CallAcknowledgeService } from './call-acknowledge.service';
import { MatCardModule } from '@angular/material/card';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { FormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { Ng5SliderModule } from 'ng5-slider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CallEvaluationModule } from '../call-evaluation/call-evaluation.module';

@NgModule({
  imports: [
    CommonModule,
    CallAcknowledgeRoutingModule,
    CallEvaluationModule,
    NgxDatatableModule,
    FormsModule,
    NgSelectModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    BsDatepickerModule.forRoot(),
    MatCardModule,
    MatSliderModule,
    Ng5SliderModule,
    MatTooltipModule
  ],
  declarations: [
    CallAcknowledgePageComponent
  ],
  providers: [CallAcknowledgeService]
})
export class CallAcknowledgeModule { }
