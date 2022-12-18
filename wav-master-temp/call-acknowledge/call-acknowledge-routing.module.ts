import { CallAcknowledgePageComponent } from './call-acknowledge.page';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {path: '', component: CallAcknowledgePageComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CallAcknowledgeRoutingModule { }
