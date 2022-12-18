import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CallReportingComponent } from './call-reporting.component';

const routes: Routes = [
  {path: '', component: CallReportingComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CallReportingRoutingModule { }
