import { CallSearchService } from './call-search.service';
import { CallSearchPageComponent } from './call-search.page';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CallSearchRoutingModule } from './call-search-routing.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatSliderModule } from '@angular/material/slider';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@NgModule({
  imports: [
    CommonModule,
    CallSearchRoutingModule,
    NgxDatatableModule,
    FormsModule,
    NgSelectModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    BsDatepickerModule.forRoot(),
    MatCardModule,
    MatSliderModule,
    MatProgressBarModule
  ],
  declarations: [
    CallSearchPageComponent
  ],
  providers: [CallSearchService]
})
export class CallSearchModule { }
