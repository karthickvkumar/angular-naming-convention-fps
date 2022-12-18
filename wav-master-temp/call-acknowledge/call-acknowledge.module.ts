import { CallAcknowledgePageComponent } from './call-acknowledge.page';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { CallAcknowledgeRoutingModule } from './call-acknowledge-routing.module';
import { CallAcknowledgeService } from './call-acknowledge.service';
import { MatCardModule } from '@angular/material/card';
@NgModule({
  imports: [
    CommonModule,
    CallAcknowledgeRoutingModule,
    NgxDatatableModule,
    MatCardModule
  ],
  declarations: [
    CallAcknowledgePageComponent
  ],
  providers: [CallAcknowledgeService]
})
export class CallAcknowledgeModule { }
