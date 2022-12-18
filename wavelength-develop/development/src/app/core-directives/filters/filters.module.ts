import { SelectComponent } from './select/select.component';
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

@NgModule({
  declarations: [SelectComponent],
  imports: [
    CommonModule,
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
})
export class FiltersModule { }
