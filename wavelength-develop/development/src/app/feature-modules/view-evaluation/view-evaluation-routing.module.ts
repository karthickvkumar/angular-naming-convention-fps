import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ViewEvaluationPageComponent } from './page/view-evaluation.page';

const routes: Routes = [
  {path: '', component: ViewEvaluationPageComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ViewEvaluationRoutingModule { }
