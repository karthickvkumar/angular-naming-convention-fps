import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FpsFormRendererComponent } from './fps-form-renderer.component';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [FpsFormRendererComponent],
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule
  ],
  exports: [FpsFormRendererComponent]
})
export class FpsFormRendererModule { }
