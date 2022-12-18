import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CallSearchPageComponent } from './call-search.page';

const routes: Routes = [
  {path: '', component: CallSearchPageComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CallSearchRoutingModule { }
